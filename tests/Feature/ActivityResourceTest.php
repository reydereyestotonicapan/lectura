<?php

use App\Filament\Resources\ActivityResource;
use App\Filament\Resources\ActivityResource\Pages\CreateActivity;
use App\Filament\Resources\ActivityResource\Pages\EditActivity;
use App\Filament\Resources\ActivityResource\Pages\ListActivities;
use App\Models\Activity;
use App\Models\Ministry;
use App\Models\Role;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Livewire\Livewire;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Users auto-assign the configured default role on creation; disable that so
    // role membership in these tests is explicit.
    config(['app.default_user_role' => null]);

    Role::findOrCreate('leader', 'web');

    Filament::setCurrentPanel(Filament::getPanel('admin'));
});

function makeLeader(): User
{
    $leader = User::factory()->create();
    $leader->assignRole('leader');

    return $leader;
}

function actAsLeader(): User
{
    $leader = makeLeader();

    test()->actingAs($leader);

    return $leader;
}

function makeMinistry(?string $ministryName = null): Ministry
{
    return Ministry::create([
        'ministry_name' => $ministryName ?? fake()->unique()->words(2, true),
        'led_by' => User::factory()->create()->id,
    ]);
}

// ---------------------------------------------------------------------------
// Task 7.1 — Principal user flows as a leader
// ---------------------------------------------------------------------------

it('persists a new activity with the submitted values and stamps the acting leader as creator', function () {
    Storage::fake('s3');

    $leader = actAsLeader();
    $ministry = makeMinistry();
    $scheduledAt = now()->addWeek()->startOfMinute();
    $image = UploadedFile::fake()->image('activity.jpg');

    Livewire::test(CreateActivity::class)
        ->fillForm([
            'name' => 'Retiro de jóvenes',
            'place' => 'Salón principal',
            'scheduled_at' => $scheduledAt,
            'ministry_id' => $ministry->id,
            'image' => $image,
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    $activity = Activity::firstOrFail();

    expect($activity->name)->toBe('Retiro de jóvenes')
        ->and($activity->place)->toBe('Salón principal')
        ->and($activity->scheduled_at->equalTo($scheduledAt))->toBeTrue()
        ->and($activity->ministry_id)->toBe($ministry->id)
        ->and($activity->created_by)->toBe($leader->id)
        ->and($activity->image)->not->toBeNull();

    Storage::disk('s3')->assertExists($activity->image);
});

it('persists an activity with no image when the image is omitted', function () {
    Storage::fake('s3');

    actAsLeader();
    $ministry = makeMinistry();

    Livewire::test(CreateActivity::class)
        ->fillForm([
            'name' => 'Vigilia',
            'place' => 'Templo',
            'scheduled_at' => now()->addDays(3)->startOfMinute(),
            'ministry_id' => $ministry->id,
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    expect(Activity::firstOrFail()->image)->toBeNull();
});

it('shows every activity in the list regardless of which user created it', function () {
    $leader = actAsLeader();
    $otherLeader = makeLeader();

    $ownActivity = Activity::factory()->create(['created_by' => $leader->id]);
    $othersActivity = Activity::factory()->create(['created_by' => $otherLeader->id]);

    Livewire::test(ListActivities::class)
        ->assertCanSeeTableRecords([$ownActivity, $othersActivity]);
});

it('updates any activity with the submitted values', function () {
    actAsLeader();
    $author = makeLeader();
    $activity = Activity::factory()->create(['created_by' => $author->id]);
    $newMinistry = makeMinistry();
    $newSchedule = now()->addMonth()->startOfMinute();

    Livewire::test(EditActivity::class, ['record' => $activity->getRouteKey()])
        ->fillForm([
            'name' => 'Conferencia actualizada',
            'place' => 'Auditorio',
            'scheduled_at' => $newSchedule,
            'ministry_id' => $newMinistry->id,
        ])
        ->call('save')
        ->assertHasNoFormErrors();

    $activity->refresh();

    expect($activity->name)->toBe('Conferencia actualizada')
        ->and($activity->place)->toBe('Auditorio')
        ->and($activity->scheduled_at->equalTo($newSchedule))->toBeTrue()
        ->and($activity->ministry_id)->toBe($newMinistry->id);
});

it('removes a deleted activity from the list', function () {
    actAsLeader();
    $activity = Activity::factory()->create();

    Livewire::test(ListActivities::class)
        ->callTableAction('delete', $activity)
        ->assertHasNoTableActionErrors();

    expect(Activity::find($activity->id))->toBeNull();

    Livewire::test(ListActivities::class)
        ->assertCanNotSeeTableRecords([$activity]);
});

// ---------------------------------------------------------------------------
// Task 7.2 — Authorization
// ---------------------------------------------------------------------------

it('lets a leader reach the index, create, and edit pages', function () {
    $leader = makeLeader();
    $activity = Activity::factory()->create();

    $this->actingAs($leader)->get(ActivityResource::getUrl('index'))->assertOk();
    $this->actingAs($leader)->get(ActivityResource::getUrl('create'))->assertOk();
    $this->actingAs($leader)
        ->get(ActivityResource::getUrl('edit', ['record' => $activity]))
        ->assertOk();
});

it('denies a non-leader requesting the resource pages directly', function () {
    $nonLeader = User::factory()->create();
    $activity = Activity::factory()->create();

    $this->actingAs($nonLeader)->get(ActivityResource::getUrl('index'))->assertForbidden();
    $this->actingAs($nonLeader)->get(ActivityResource::getUrl('create'))->assertForbidden();
    $this->actingAs($nonLeader)
        ->get(ActivityResource::getUrl('edit', ['record' => $activity]))
        ->assertForbidden();
});

it('hides the navigation entry for non-leaders and shows it for leaders', function () {
    $leader = makeLeader();
    $nonLeader = User::factory()->create();

    $this->actingAs($nonLeader);
    expect(ActivityResource::shouldRegisterNavigation())->toBeFalse();

    $this->actingAs($leader);
    expect(ActivityResource::shouldRegisterNavigation())->toBeTrue();
});

it('denies a non-leader attempting create, edit, and delete directly', function () {
    $nonLeader = User::factory()->create();

    $this->actingAs($nonLeader);

    expect(ActivityResource::canCreate())->toBeFalse();

    $activity = Activity::factory()->create();

    expect(ActivityResource::canEdit($activity))->toBeFalse()
        ->and(ActivityResource::canDelete($activity))->toBeFalse();
});

// ---------------------------------------------------------------------------
// Task 7.3 — Edge cases that matter
// ---------------------------------------------------------------------------

it('rejects creating an activity that is missing a required field and persists nothing', function (string $missingField) {
    actAsLeader();
    $ministry = makeMinistry();

    $data = [
        'name' => 'Actividad',
        'place' => 'Lugar',
        'scheduled_at' => now()->addWeek()->startOfMinute(),
        'ministry_id' => $ministry->id,
    ];
    unset($data[$missingField]);

    Livewire::test(CreateActivity::class)
        ->fillForm($data)
        ->call('create')
        ->assertHasFormErrors([$missingField => 'required']);

    expect(Activity::count())->toBe(0);
})->with(['name', 'place', 'scheduled_at', 'ministry_id']);

it('rejects editing an activity into a missing required field and does not mutate it', function (string $missingField) {
    actAsLeader();
    $activity = Activity::factory()->create([
        'name' => 'Original',
        'place' => 'Lugar original',
    ]);
    $original = $activity->only(['name', 'place', 'scheduled_at', 'ministry_id']);

    Livewire::test(EditActivity::class, ['record' => $activity->getRouteKey()])
        ->fillForm([$missingField => null])
        ->call('save')
        ->assertHasFormErrors([$missingField => 'required']);

    expect($activity->refresh()->only(['name', 'place', 'scheduled_at', 'ministry_id']))
        ->toEqual($original);
})->with(['name', 'place', 'scheduled_at', 'ministry_id']);

it('renders the list with no activities', function () {
    actAsLeader();

    Livewire::test(ListActivities::class)
        ->assertSuccessful()
        ->assertCountTableRecords(0);
});

it('lists an activity whose ministry was deleted without error and keeps a null ministry', function () {
    actAsLeader();
    $ministry = makeMinistry();
    $activity = Activity::factory()->create(['ministry_id' => $ministry->id]);

    $ministry->delete();

    expect($activity->refresh()->ministry_id)->toBeNull();

    Livewire::test(ListActivities::class)
        ->assertSuccessful()
        ->assertCanSeeTableRecords([$activity]);
});

it('keeps an activity listable, editable, and deletable after its creator is deleted', function () {
    actAsLeader();
    $creator = makeLeader();
    $activity = Activity::factory()->create(['created_by' => $creator->id]);

    $creator->delete();

    expect($activity->refresh()->created_by)->toBeNull();

    Livewire::test(ListActivities::class)
        ->assertCanSeeTableRecords([$activity]);

    Livewire::test(EditActivity::class, ['record' => $activity->getRouteKey()])
        ->fillForm(['name' => 'Editada tras borrar autor'])
        ->call('save')
        ->assertHasNoFormErrors();

    expect($activity->refresh()->name)->toBe('Editada tras borrar autor');

    Livewire::test(ListActivities::class)
        ->callTableAction('delete', $activity)
        ->assertHasNoTableActionErrors();

    expect(Activity::find($activity->id))->toBeNull();
});
