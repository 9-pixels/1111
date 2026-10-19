import { muscleColors } from '@/constants/colors';
import type { ExperienceLevel, UserProfile } from '@/lib/fitness';

export type Equipment =
  | 'Barbell'
  | 'Dumbbells'
  | 'Cable'
  | 'Machine'
  | 'Bodyweight'
  | 'Bands';

export interface MuscleGroup {
  id: string;
  name: string;
  description: string;
  focus: string;
  moveCount: number;
  color: string;
  icon: 'activity' | 'zap' | 'target' | 'arrow-up-right' | 'wind' | 'circle';
}

export interface Exercise {
  id: string;
  name: string;
  group: string;
  focus: string;
  equipment: Equipment;
  level: ExperienceLevel;
  sets: number;
  reps: string;
  restSeconds: number;
  description: string;
  steps: string[];
  mistakes: string[];
  safetyNote: string;
}

const groupSeeds: Array<Omit<MuscleGroup, 'color' | 'moveCount'> & { names: string[] }> = [
  {
    id: 'chest',
    name: 'Chest',
    description: 'Upper, mid & lower',
    focus: 'Upper, mid & lower chest',
    icon: 'activity',
    names: [
      'Barbell Bench Press', 'Incline Dumbbell Press', 'Cable Chest Fly', 'Incline Barbell Bench Press',
      'Dumbbell Bench Press', 'Decline Barbell Bench Press', 'Decline Dumbbell Press', 'Low-to-High Cable Fly',
      'High-to-Low Cable Fly', 'Pec Deck Fly', 'Single-Arm Cable Fly', 'Dumbbell Pullover',
      'Push-Up', 'Feet-Elevated Push-Up', 'Close-Grip Push-Up', 'Machine Chest Press',
      'Smith Machine Bench Press', 'Landmine Press', 'Cable Crossover', 'Dumbbell Squeeze Press',
    ],
  },
  {
    id: 'back',
    name: 'Back',
    description: 'Lats, traps & lower back',
    focus: 'Lats, traps & lower back',
    icon: 'arrow-up-right',
    names: [
      'Barbell Bent-Over Row', 'Lat Pulldown', 'Seated Cable Row', 'One-Arm Dumbbell Row',
      'Pull-Up', 'Assisted Pull-Up', 'Chest-Supported Dumbbell Row', 'T-Bar Row',
      'Straight-Arm Cable Pulldown', 'Face Pull', 'Barbell Deadlift', 'Rack Pull',
      'Dumbbell Shrug', 'Barbell Shrug', 'Inverted Row', 'Machine High Row',
      'Close-Grip Lat Pulldown', 'Back Extension',
    ],
  },
  {
    id: 'shoulders',
    name: 'Shoulders',
    description: 'Delts & stability',
    focus: 'Front, side & rear delts',
    icon: 'target',
    names: [
      'Dumbbell Shoulder Press', 'Barbell Overhead Press', 'Dumbbell Lateral Raise', 'Cable Lateral Raise',
      'Dumbbell Front Raise', 'Cable Front Raise', 'Reverse Pec Deck', 'Bent-Over Dumbbell Raise',
      'Arnold Press', 'Machine Shoulder Press', 'Landmine Shoulder Press', 'Upright Row',
      'Cable Rear-Delt Fly', 'Band Pull-Apart',
    ],
  },
  {
    id: 'biceps',
    name: 'Biceps',
    description: 'Curls & pulls',
    focus: 'Biceps & brachialis',
    icon: 'zap',
    names: [
      'Barbell Biceps Curl', 'Alternating Dumbbell Curl', 'Hammer Curl', 'Preacher Curl',
      'Incline Dumbbell Curl', 'Cable Biceps Curl', 'Concentration Curl', 'EZ-Bar Curl',
      'Reverse Curl', 'Cross-Body Hammer Curl', 'Bayesian Cable Curl', 'Resistance Band Curl',
      'Machine Biceps Curl',
    ],
  },
  {
    id: 'triceps',
    name: 'Triceps',
    description: 'Pressing power',
    focus: 'Triceps & elbow extension',
    icon: 'zap',
    names: [
      'Cable Triceps Pushdown', 'Overhead Cable Triceps Extension', 'Dumbbell Overhead Triceps Extension',
      'Lying EZ-Bar Triceps Extension', 'Close-Grip Bench Press', 'Dumbbell Triceps Kickback',
      'Rope Triceps Pushdown', 'Single-Arm Cable Extension', 'Bench Dip', 'Diamond Push-Up',
      'Machine Triceps Extension', 'Cable Skull Crusher', 'Resistance Band Triceps Pressdown',
    ],
  },
  {
    id: 'legs',
    name: 'Legs',
    description: 'Quads & hamstrings',
    focus: 'Quads, hamstrings & adductors',
    icon: 'activity',
    names: [
      'Barbell Back Squat', 'Front Squat', 'Goblet Squat', 'Leg Press',
      'Romanian Deadlift', 'Dumbbell Romanian Deadlift', 'Lying Leg Curl', 'Seated Leg Curl',
      'Leg Extension', 'Walking Lunge', 'Reverse Lunge', 'Bulgarian Split Squat',
      'Step-Up', 'Hack Squat', 'Good Morning', 'Nordic Hamstring Curl',
    ],
  },
  {
    id: 'glutes',
    name: 'Glutes',
    description: 'Power & shape',
    focus: 'Glute max, medius & hip stability',
    icon: 'target',
    names: [
      'Barbell Hip Thrust', 'Dumbbell Hip Thrust', 'Glute Bridge', 'Cable Glute Kickback',
      'Dumbbell Bulgarian Split Squat', 'Dumbbell Step-Up', 'Cable Hip Abduction', 'Banded Lateral Walk',
      'Single-Leg Glute Bridge', 'Kettlebell Swing', 'Sumo Deadlift', 'Frog Pump',
    ],
  },
  {
    id: 'calves',
    name: 'Calves',
    description: 'Lower-leg strength',
    focus: 'Gastrocnemius & soleus',
    icon: 'activity',
    names: [
      'Standing Calf Raise', 'Seated Calf Raise', 'Leg Press Calf Press',
      'Single-Leg Calf Raise', 'Donkey Calf Raise', 'Smith Machine Calf Raise',
      'Bodyweight Calf Raise', 'Dumbbell Calf Raise', 'Tibialis Raise',
    ],
  },
  {
    id: 'core',
    name: 'Core',
    description: 'Abs & obliques',
    focus: 'Abs, obliques & trunk stability',
    icon: 'circle',
    names: [
      'Front Plank', 'Side Plank', 'Dead Bug', 'Bird Dog', 'Bicycle Crunch',
      'Reverse Crunch', 'Hanging Knee Raise', 'Cable Crunch', 'Ab Wheel Rollout',
      'Russian Twist', 'Pallof Press', 'Mountain Climber', 'Weighted Sit-Up',
      'Hollow Body Hold', 'Wood Chop',
    ],
  },
  {
    id: 'forearms',
    name: 'Forearms',
    description: 'Grip & wrist control',
    focus: 'Wrist flexors, extensors & grip',
    icon: 'zap',
    names: [
      'Wrist Curl', 'Reverse Wrist Curl', 'Dumbbell Wrist Extension', 'Barbell Reverse Curl',
      'Farmer Carry', 'Dead Hang', 'Plate Pinch Hold', 'Towel Grip Pull-Up',
      'Wrist Roller', 'Dumbbell Pronation and Supination',
    ],
  },
  {
    id: 'neck',
    name: 'Neck',
    description: 'Mobility & isometrics',
    focus: 'Gentle neck mobility',
    icon: 'wind',
    names: [
      'Neck Flexion Isometric', 'Neck Extension Isometric', 'Lateral Neck Isometric',
      'Gentle Neck Flexion', 'Gentle Neck Extension', 'Gentle Neck Rotation',
      'Chin Tuck', 'Neck Side Bend Stretch',
    ],
  },
  {
    id: 'jaw-face',
    name: 'Jaw & Face',
    description: 'Gentle facial work',
    focus: 'Gentle facial movement',
    icon: 'circle',
    names: [
      'Relaxed Jaw Release', 'Controlled Jaw Opening', 'Gentle Cheek Lift',
      'Lip Press and Release', 'Soft Smile Hold', 'Tongue-to-Roof Hold',
      'Gentle Facial Relaxation',
    ],
  },
];

export const muscleGroups: MuscleGroup[] = groupSeeds.map(({ names, ...group }) => ({
  ...group,
  color: muscleColors[group.name as keyof typeof muscleColors],
  moveCount: names.length,
}));

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function inferEquipment(name: string): Equipment {
  const value = name.toLowerCase();
  if (/band|towel grip/.test(value)) return 'Bands';
  if (/cable|wood chop/.test(value)) return 'Cable';
  if (/machine|pec deck|leg press|hack squat|leg curl|leg extension/.test(value)) return 'Machine';
  if (/barbell|ez-bar|smith machine/.test(value)) return 'Barbell';
  if (/dumbbell|kettlebell/.test(value)) return 'Dumbbells';
  return 'Bodyweight';
}

function inferFocus(group: string, name: string) {
  const text = name.toLowerCase();
  if (group === 'Chest') {
    if (/incline|low-to-high/.test(text)) return 'Upper chest';
    if (/decline|high-to-low/.test(text)) return 'Lower chest';
    if (/fly|crossover/.test(text)) return 'Inner chest';
    return 'Mid chest';
  }
  if (group === 'Back') {
    if (/deadlift|extension|rack pull/.test(text)) return 'Lower back';
    if (/shrug|face pull/.test(text)) return 'Traps & rear delts';
    if (/pulldown|pull-up/.test(text)) return 'Lats';
    return 'Mid back';
  }
  if (group === 'Shoulders') {
    if (/rear|reverse|face pull|pull-apart/.test(text)) return 'Rear delts';
    if (/front|overhead|arnold/.test(text)) return 'Front delts';
    return 'Side delts';
  }
  return group === 'Jaw & Face' ? 'Facial muscles' : group === 'Neck' ? 'Neck mobility' : group;
}

type MovementFamily = 'press' | 'fly' | 'pull' | 'curl' | 'extension' | 'squat' | 'hinge' | 'raise' | 'core' | 'calf' | 'mobility' | 'face';

function inferFamily(name: string, group: string): MovementFamily {
  const text = name.toLowerCase();
  if (group === 'Jaw & Face') return 'face';
  if (group === 'Neck') return 'mobility';
  if (/calf|tibialis/.test(text)) return 'calf';
  if (/plank|crunch|dead bug|bird dog|knee raise|rollout|twist|pallof|climber|sit-up|hollow|wood chop/.test(text)) return 'core';
  if (/curl/.test(text) && group === 'Biceps') return 'curl';
  if (/pushdown|extension|kickback|dip/.test(text) && group === 'Triceps') return 'extension';
  if (/fly|crossover|pull-apart/.test(text)) return 'fly';
  if (/squat|lunge|step-up|leg press/.test(text)) return 'squat';
  if (/deadlift|hinge|good morning|swing|hip thrust|bridge|kickback/.test(text)) return 'hinge';
  if (/raise|abduction|lateral walk/.test(text)) return 'raise';
  if (/press|push-up/.test(text)) return 'press';
  if (/row|pull-up|pulldown|shrug|carry|hang/.test(text)) return 'pull';
  if (/curl/.test(text)) return 'curl';
  return group === 'Forearms' ? 'curl' : 'pull';
}

function buildInstructions(name: string, group: string, family: MovementFamily) {
  const muscle = inferFocus(group, name).toLowerCase();
  const nameLower = name.toLowerCase();
  const variants: Record<MovementFamily, { steps: string[]; mistakes: string[]; safety: string }> = {
    press: {
      steps: ['Set your feet firmly and brace your trunk before moving.', `Lower the load toward your ${muscle} with control, keeping wrists stacked over elbows.`, 'Press smoothly through the full comfortable range without bouncing or locking out aggressively.'],
      mistakes: ['Letting the shoulders roll forward', 'Bouncing at the bottom of the rep', 'Using momentum instead of controlled pressure'],
      safety: 'Use a load you can control for every rep. For challenging barbell sets, use safety catches or a spotter.',
    },
    fly: {
      steps: ['Set the handles or body position so the shoulders feel comfortable.', 'Keep a soft bend in the elbows and bring the arms together in a controlled arc.', 'Pause briefly as the target muscles contract, then return slowly without overstretching.'],
      mistakes: ['Turning the movement into a press', 'Stretching beyond a comfortable shoulder range', 'Allowing the weights to swing'],
      safety: 'Use a light starting load and stop if you feel sharp shoulder or chest pain.',
    },
    pull: {
      steps: ['Set a stable stance or seat and keep your ribs stacked over your pelvis.', `Start the pull by moving the shoulder blades, then guide the load toward your ${muscle}.`, 'Pause briefly, then return to the start under control.'],
      mistakes: ['Jerking the load from the start', 'Rounding the lower back', 'Shrugging instead of controlling the shoulder blades'],
      safety: 'Keep your spine neutral and use a manageable range. Stop if you feel sharp back or shoulder pain.',
    },
    curl: {
      steps: ['Stand or sit tall with the upper arm steady and wrist neutral.', 'Bend the elbow to lift the weight without swinging the torso.', 'Lower slowly until the arm is nearly straight, keeping tension through the movement.'],
      mistakes: ['Rocking the body to lift the load', 'Letting the elbow drift forward', 'Dropping quickly through the lowering phase'],
      safety: 'Choose a weight that keeps the wrist and elbow comfortable; stop for sharp joint pain.',
    },
    extension: {
      steps: ['Set your shoulders and keep the upper arm stable.', 'Straighten the elbow smoothly through a comfortable range.', 'Return slowly, keeping the movement focused at the elbow.'],
      mistakes: ['Flaring the elbows', 'Using the shoulders to swing the weight', 'Forcing the elbow into a painful lockout'],
      safety: 'Use controlled resistance and avoid painful elbow positions.',
    },
    squat: {
      steps: ['Stand with a stable stance and brace before each repetition.', 'Sit the hips down and back while keeping the whole foot grounded.', 'Drive through the floor to stand, keeping knees tracking comfortably with the toes.'],
      mistakes: ['Lifting the heels', 'Letting the knees collapse inward', 'Rushing into a depth you cannot control'],
      safety: 'Use a depth and load you can control. Rack barbell work safely and stop for sharp hip, knee, or back pain.',
    },
    hinge: {
      steps: ['Stand tall, soften the knees, and brace your midsection.', 'Move the hips back while keeping the spine long and the load close.', 'Drive the hips forward to return to standing without leaning back.'],
      mistakes: ['Rounding the lower back', 'Bending the knees into a squat', 'Letting the weight drift away from the body'],
      safety: 'Start light and keep the spine neutral. Stop if you feel sharp pain in the back or hips.',
    },
    raise: {
      steps: ['Set a tall, stable position and keep the working joint relaxed.', `Lift through a controlled range while focusing on your ${muscle}.`, 'Pause briefly, then lower slowly without swinging.'],
      mistakes: ['Using momentum', 'Shrugging the shoulders', 'Lifting beyond a comfortable range'],
      safety: 'Choose a light load and keep the movement pain-free and controlled.',
    },
    core: {
      steps: ['Set your ribs over your pelvis and breathe out gently to brace.', 'Move only as far as you can while keeping the trunk steady.', 'Return with control and reset your breathing before the next repetition.'],
      mistakes: ['Arching the lower back', 'Holding your breath for too long', 'Moving faster than you can control'],
      safety: 'Keep breathing throughout. Stop if the movement causes back or neck pain.',
    },
    calf: {
      steps: ['Place the feet securely and hold a stable support if needed.', 'Rise through the balls of the feet, pausing at the top.', 'Lower slowly until you feel a gentle stretch, then repeat.'],
      mistakes: ['Bouncing at the bottom', 'Rolling the ankles outward', 'Using a partial range without control'],
      safety: 'Use stable footing and a pain-free range, especially if you have ankle or Achilles discomfort.',
    },
    mobility: {
      steps: ['Sit or stand tall and keep the jaw and shoulders relaxed.', `Move gently into the ${nameLower.replace('gentle ', '')} direction without forcing the range.`, 'Hold only a comfortable position, breathe normally, and return to neutral.'],
      mistakes: ['Forcing the neck through discomfort', 'Moving quickly or using momentum', 'Holding your breath or clenching the jaw'],
      safety: 'Use gentle, pain-free movement only. Stop for dizziness, numbness, tingling, or pain; ask a clinician about persistent symptoms.',
    },
    face: {
      steps: ['Relax your shoulders and let the jaw rest comfortably.', `Perform ${nameLower} with a small, easy range and no force.`, 'Release fully between repetitions and keep breathing normally.'],
      mistakes: ['Clenching the teeth', 'Using force or exaggerated facial tension', 'Continuing through jaw discomfort'],
      safety: 'Gentle facial exercises are not a treatment. Stop if you feel jaw pain or clicking that concerns you.',
    },
  };
  return variants[family];
}

function createExercise(group: MuscleGroup, name: string, index: number): Exercise {
  const id = `${group.id}-${slugify(name)}`;
  const equipment = inferEquipment(name);
  const family = inferFamily(name, group.name);
  const focus = inferFocus(group.name, name);
  const level: ExperienceLevel =
    group.name === 'Neck' || group.name === 'Jaw & Face' || equipment === 'Bodyweight' || equipment === 'Machine'
      ? 'Beginner'
      : index % 4 === 3
        ? 'Advanced'
        : 'Intermediate';
  let sets = family === 'core' || family === 'mobility' || family === 'face' ? 3 : 4;
  let reps = family === 'fly' || family === 'raise' || family === 'extension' ? '12-15' : family === 'press' || family === 'squat' || family === 'hinge' ? '6-10' : '8-12';
  let restSeconds = family === 'press' || family === 'squat' || family === 'hinge' || family === 'pull' ? 90 : 60;
  if (family === 'core' || family === 'mobility' || family === 'face') {
    reps = family === 'core' ? '10-15' : '20-30 sec';
    restSeconds = family === 'face' || family === 'mobility' ? 30 : 45;
  }
  if (group.name === 'Chest' && name === 'Barbell Bench Press') {
    sets = 4; reps = '6-10'; restSeconds = 90;
  } else if (group.name === 'Chest' && name === 'Incline Dumbbell Press') {
    sets = 4; reps = '8-12'; restSeconds = 90;
  } else if (group.name === 'Chest' && name === 'Cable Chest Fly') {
    sets = 3; reps = '12-15'; restSeconds = 60;
  }
  const instructions = buildInstructions(name, group.name, family);
  const description =
    group.name === 'Jaw & Face'
      ? `${name} is a gentle facial movement. Keep effort light and stop if the jaw feels uncomfortable.`
      : group.name === 'Neck'
        ? `${name} is a low-effort neck mobility drill. Stay within an easy, pain-free range and breathe normally.`
        : `${name} is a ${level.toLowerCase()} ${equipment.toLowerCase()} movement for the ${focus.toLowerCase()}. Use a deliberate tempo and a range you can control.`;
  return {
    id,
    name,
    group: group.name,
    focus,
    equipment,
    level,
    sets,
    reps,
    restSeconds,
    description,
    steps: instructions.steps,
    mistakes: instructions.mistakes,
    safetyNote: instructions.safety,
  };
}

export const exercises: Exercise[] = groupSeeds.flatMap(({ names, ...seed }) => {
  const group = muscleGroups.find((item) => item.id === seed.id)!;
  return names.map((name, index) => createExercise(group, name, index));
});

export function getExerciseById(id: string) {
  return exercises.find((exercise) => exercise.id === id);
}

export function getGroupById(id: string) {
  return muscleGroups.find((group) => group.id === id);
}

export function getSuggestedWorkout(profile: UserProfile, date = new Date()) {
  const weekday = (date.getDay() + 6) % 7;
  const trainingPosition = profile.trainingWeekdays.indexOf(weekday);
  if (trainingPosition < 0) return { title: 'Rest day', exerciseIds: [] as string[] };
  const weekNumber = Math.floor(
    (new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() -
      new Date(date.getFullYear(), 0, 1).getTime()) /
      604800000,
  );
  const split = [
    { title: 'Upper body power', groups: ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps'] },
    { title: 'Lower body strength', groups: ['Legs', 'Glutes', 'Calves', 'Core'] },
    { title: 'Push & shoulders', groups: ['Chest', 'Shoulders', 'Triceps'] },
    { title: 'Pull & arms', groups: ['Back', 'Biceps', 'Forearms'] },
    { title: 'Full body balance', groups: ['Legs', 'Chest', 'Back', 'Core'] },
    { title: 'Legs & core', groups: ['Legs', 'Glutes', 'Calves', 'Core'] },
    { title: 'Strength focus', groups: ['Chest', 'Back', 'Legs', 'Shoulders'] },
  ][(trainingPosition + weekNumber) % 7];
  const candidates = exercises.filter((exercise) => split.groups.includes(exercise.group));
  const offset = (trainingPosition * 3 + weekNumber) % Math.max(1, candidates.length);
  const rotated = [...candidates.slice(offset), ...candidates.slice(0, offset)];
  return { title: split.title, exerciseIds: rotated.slice(0, 6).map((exercise) => exercise.id) };
}

export const EQUIPMENT_FILTERS = ['All', 'Barbell', 'Dumbbells', 'Cable', 'Machine', 'Bodyweight', 'Bands'] as const;
