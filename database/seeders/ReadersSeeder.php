<?php

namespace Database\Seeders;

use App\Constants\StatusResponse;
use App\Models\Answer;
use App\Models\Day;
use App\Models\Question;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class ReadersSeeder extends Seeder
{
    // Days responded per user → determines category
    // gold  >= 20 days
    // silver >= 10 days
    // bronze < 10 days
    private const array READERS = [
        ['name' => 'Miguel Menchu',    'email' => 'mmenchu@compassion.com',          'days' => 25], // gold
        ['name' => 'Menchu Xoyon',     'email' => 'menchuxoyon@hotmail.com',          'days' => 15], // silver
        ['name' => 'Iglesia Rey Reyes','email' => 'iglesiareydereyes298@gmail.com',   'days' => 5],  // bronze
    ];

    private const array BIBLE_DAYS = [
        ['chapters' => 'Génesis 1-2',        'question' => '¿Qué creó Dios en el primer día?',                  'correct' => 'La luz',           'wrong' => ['El agua', 'Los animales']],
        ['chapters' => 'Génesis 3-4',        'question' => '¿Quién tentó a Eva en el huerto?',                  'correct' => 'La serpiente',      'wrong' => ['El ángel', 'Adán']],
        ['chapters' => 'Génesis 5-6',        'question' => '¿A quién le encomendó Dios construir el arca?',     'correct' => 'Noé',               'wrong' => ['Abraham', 'Moisés']],
        ['chapters' => 'Génesis 7-8',        'question' => '¿Cuántos días duró el diluvio?',                   'correct' => '40 días y noches',  'wrong' => ['7 días', '100 días']],
        ['chapters' => 'Génesis 9-10',       'question' => '¿Cuál fue la señal del pacto de Dios con Noé?',     'correct' => 'El arco iris',      'wrong' => ['Una estrella', 'Una nube']],
        ['chapters' => 'Génesis 11-12',      'question' => '¿Cómo se llamaba la torre que intentaron construir?','correct' => 'Torre de Babel',   'wrong' => ['Torre de Sión', 'Torre de David']],
        ['chapters' => 'Génesis 13-14',      'question' => '¿A quién le dio Abraham el diezmo?',                'correct' => 'Melquisedec',       'wrong' => ['Lot', 'Eliezer']],
        ['chapters' => 'Génesis 15-16',      'question' => '¿Qué símbolo usó Dios para su pacto con Abraham?', 'correct' => 'Animales partidos', 'wrong' => ['Una paloma', 'Un altar']],
        ['chapters' => 'Génesis 17-18',      'question' => '¿Qué significa el nombre Isaac?',                  'correct' => 'El que ríe',        'wrong' => ['El elegido', 'El prometido']],
        ['chapters' => 'Génesis 19-20',      'question' => '¿En qué se convirtió la esposa de Lot?',           'correct' => 'Estatua de sal',    'wrong' => ['Piedra', 'Polvo']],
        ['chapters' => 'Génesis 21-22',      'question' => '¿Qué sacrificio pidió Dios a Abraham?',            'correct' => 'Su hijo Isaac',     'wrong' => ['Un buey', 'Un cordero']],
        ['chapters' => 'Génesis 23-24',      'question' => '¿A quién tomó Isaac como esposa?',                 'correct' => 'Rebeca',            'wrong' => ['Lea', 'Raquel']],
        ['chapters' => 'Génesis 25-26',      'question' => '¿Qué vendió Esaú a Jacob?',                        'correct' => 'Su primogenitura',  'wrong' => ['Su heredad', 'Su ropa']],
        ['chapters' => 'Génesis 27-28',      'question' => '¿Qué soñó Jacob con una escalera?',                'correct' => 'Ángeles subiendo y bajando', 'wrong' => ['Un gran ejército', 'Un río de agua']],
        ['chapters' => 'Génesis 29-30',      'question' => '¿A cuántas esposas tuvo Jacob?',                   'correct' => '4',                 'wrong' => ['2', '3']],
        ['chapters' => 'Génesis 31-32',      'question' => '¿Con quién luchó Jacob toda la noche?',            'correct' => 'Un ángel',          'wrong' => ['Esaú', 'Labán']],
        ['chapters' => 'Génesis 33-34',      'question' => '¿Cómo se llamó Jacob después de su lucha?',        'correct' => 'Israel',            'wrong' => ['Josué', 'Judá']],
        ['chapters' => 'Génesis 35-36',      'question' => '¿Cuántos hijos tuvo Jacob?',                       'correct' => '12',                'wrong' => ['10', '14']],
        ['chapters' => 'Génesis 37-38',      'question' => '¿A qué precio vendieron los hermanos a José?',     'correct' => '20 piezas de plata','wrong' => ['30 monedas', '50 denarios']],
        ['chapters' => 'Génesis 39-40',      'question' => '¿Quién interpretó los sueños en la prisión?',      'correct' => 'José',              'wrong' => ['Daniel', 'Samuel']],
        ['chapters' => 'Génesis 41-42',      'question' => '¿Cuántas vacas gordas vio el faraón en su sueño?', 'correct' => '7',                 'wrong' => ['14', '5']],
        ['chapters' => 'Génesis 43-44',      'question' => '¿Qué copa escondió José en el saco de Benjamín?',  'correct' => 'Una copa de plata', 'wrong' => ['Una copa de oro', 'Un anillo']],
        ['chapters' => 'Génesis 45-46',      'question' => '¿Cuántas personas de la familia de Jacob bajaron a Egipto?', 'correct' => '70',   'wrong' => ['60', '80']],
        ['chapters' => 'Génesis 47-48',      'question' => '¿Qué tribu recibió la bendición de primogénito de Jacob?', 'correct' => 'Efraín', 'wrong' => ['Manasés', 'Judá']],
        ['chapters' => 'Génesis 49-50',      'question' => '¿A qué tribu Jacob profetizó que gobernaría?',     'correct' => 'Judá',              'wrong' => ['Leví', 'Rubén']],
        ['chapters' => 'Éxodo 1-2',          'question' => '¿De qué tribu era Moisés?',                        'correct' => 'Leví',              'wrong' => ['Judá', 'Rubén']],
        ['chapters' => 'Éxodo 3-4',          'question' => '¿En qué objeto se apareció Dios a Moisés?',        'correct' => 'Una zarza ardiente', 'wrong' => ['Una nube', 'Un ángel visible']],
        ['chapters' => 'Éxodo 5-6',          'question' => '¿Cómo respondió el faraón al pedido de Moisés?',   'correct' => 'Aumentó el trabajo','wrong' => ['Los liberó', 'Los castigó con muerte']],
        ['chapters' => 'Éxodo 7-8',          'question' => '¿Cuál fue la primera plaga de Egipto?',            'correct' => 'El agua se convirtió en sangre', 'wrong' => ['Las ranas', 'Las langostas']],
        ['chapters' => 'Éxodo 9-10',         'question' => '¿Cuántas plagas enviaron Dios sobre Egipto en total?', 'correct' => '10',           'wrong' => ['7', '12']],
    ];

    public function run(): void
    {
        $defaultRole = Role::where('name', 'default_user')->firstOrFail();
        $month = Carbon::create(now()->year, now()->month, 1);

        // Create 30 days with questions and answers
        $days = [];
        foreach (self::BIBLE_DAYS as $i => $data) {
            $date = $month->copy()->addDays($i);
            $day = Day::firstOrCreate(
                ['day_month' => $date->format('d') . '/' . $date->format('m')],
                ['date_assigned' => $date->format('Y-m-d'), 'chapters' => $data['chapters']]
            );

            $question = Question::firstOrCreate(
                ['day_id' => $day->id, 'question' => $data['question']]
            );

            $correctAnswer = Answer::firstOrCreate(
                ['question_id' => $question->id, 'description' => $data['correct']],
                ['is_correct' => true]
            );

            foreach ($data['wrong'] as $wrong) {
                Answer::firstOrCreate(
                    ['question_id' => $question->id, 'description' => $wrong],
                    ['is_correct' => false]
                );
            }

            $days[] = ['day' => $day, 'question' => $question, 'answer' => $correctAnswer];
        }

        // Create reader users and their responses
        foreach (self::READERS as $readerData) {
            $user = User::firstOrCreate(
                ['email' => $readerData['email']],
                ['name' => $readerData['name'], 'password' => bcrypt('password')]
            );

            if (!$user->hasRole($defaultRole)) {
                $user->assignRole($defaultRole);
            }

            // Create responses for the first N days
            for ($i = 0; $i < $readerData['days']; $i++) {
                $entry = $days[$i];
                $alreadyAnswered = \App\Models\Response::where('user_id', $user->id)
                    ->where('day_id', $entry['day']->id)
                    ->where('question_id', $entry['question']->id)
                    ->exists();

                if (!$alreadyAnswered) {
                    \App\Models\Response::create([
                        'user_id'      => $user->id,
                        'day_id'       => $entry['day']->id,
                        'question_id'  => $entry['question']->id,
                        'answer_id'    => $entry['answer']->id,
                        'status'       => StatusResponse::EXPECTED->getLabel(),
                    ]);
                }
            }
        }
    }
}
