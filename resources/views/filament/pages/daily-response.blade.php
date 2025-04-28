<x-filament-panels::page>
    <form wire:submit="create">
        {{ $this->form }}

        @if (isset($data['questions']) && ! empty($data['questions']))
        <x-filament::button type="submit" class="w-full md:w-auto">
            Guardar Respuestas
        </x-filament::button>
        @endif
    </form>

    <x-filament-actions::modals />
</x-filament-panels::page>
