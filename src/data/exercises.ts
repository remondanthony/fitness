import type { ImagePlaceholderVariant } from "@/components/ui/ImagePlaceholder";
import type { Difficulty, Faceted, FilterGroupDef } from "@/data/types";

export type ExerciseMistake = {
  title: string;
  detail: string;
};

export type Prescription = {
  goal: string;
  sets: string;
  reps: string;
  rest: string;
};

export type Exercise = Faceted & {
  slug: string;
  name: string;
  /** Display label for the primary muscle, e.g. "Hamstrings / Glutes". */
  primaryMuscle: string;
  equipmentLabel: string;
  difficulty: Difficulty;
  artwork: ImagePlaceholderVariant;
  summary: string;
  musclesWorked: {
    primary: string[];
    secondary: string[];
  };
  instructions: string[];
  mistakes: ExerciseMistake[];
  tips: string[];
  prescription: Prescription[];
  /** Slugs of comparable movements. */
  alternatives: string[];
};

/** Filter groups rendered on /exercises, in display order. */
export const exerciseFilterGroups: FilterGroupDef[] = [
  {
    id: "muscle",
    label: "Muscle Group",
    options: [
      { value: "chest", label: "Chest" },
      { value: "back", label: "Back" },
      { value: "shoulders", label: "Shoulders" },
      { value: "biceps", label: "Biceps" },
      { value: "triceps", label: "Triceps" },
      { value: "legs", label: "Legs" },
      { value: "glutes", label: "Glutes" },
      { value: "core", label: "Core" },
    ],
  },
  {
    id: "equipment",
    label: "Equipment",
    options: [
      { value: "barbell", label: "Barbell" },
      { value: "dumbbell", label: "Dumbbell" },
      { value: "kettlebell", label: "Kettlebell" },
      { value: "cable", label: "Cable" },
      { value: "machine", label: "Machine" },
      { value: "bodyweight", label: "Bodyweight" },
    ],
  },
  {
    id: "difficulty",
    label: "Difficulty",
    options: [
      { value: "beginner", label: "Beginner" },
      { value: "intermediate", label: "Intermediate" },
      { value: "advanced", label: "Advanced" },
    ],
  },
];

export const exercises: Exercise[] = [
  {
    slug: "barbell-bench-press",
    name: "Barbell Bench Press",
    primaryMuscle: "Chest",
    equipmentLabel: "Barbell",
    difficulty: "Intermediate",
    artwork: "program",
    summary:
      "The benchmark upper-body press. Builds chest, front delts and triceps under heavy, repeatable load.",
    musclesWorked: {
      primary: ["Pectoralis major", "Anterior deltoid"],
      secondary: ["Triceps brachii", "Serratus anterior"],
    },
    instructions: [
      "Set your eyes under the bar, plant both feet, and pull your shoulder blades down and back into the bench.",
      "Grip roughly one and a half times shoulder width, unrack the bar and hold it stacked over your shoulders.",
      "Lower under control to the base of your sternum, keeping your elbows around 45 degrees from your torso.",
      "Press back to the start, driving through your feet without letting your hips leave the bench.",
    ],
    mistakes: [
      {
        title: "Flaring the elbows to 90 degrees",
        detail: "It puts the shoulder in its weakest position. Tuck to roughly 45 degrees instead.",
      },
      {
        title: "Bouncing the bar off the chest",
        detail: "You lose the hardest part of the rep and load the ribcage. Touch, pause, press.",
      },
      {
        title: "Losing the upper-back wedge",
        detail: "If the shoulder blades unpack mid-set you lose your press platform and stability.",
      },
    ],
    tips: [
      "Grip the bar hard enough to leave marks — grip tension travels up into the shoulder.",
      "Think about pressing yourself away from the bar rather than pushing the bar up.",
      "Use a spotter or safety pins on any set you take close to failure.",
    ],
    prescription: [
      { goal: "Strength", sets: "4–5", reps: "3–5", rest: "3 min" },
      { goal: "Hypertrophy", sets: "3–4", reps: "6–10", rest: "90 s" },
      { goal: "Endurance", sets: "2–3", reps: "12–15", rest: "60 s" },
    ],
    alternatives: ["incline-dumbbell-press", "push-up", "close-grip-bench-press"],
    facets: { muscle: ["chest"], equipment: ["barbell"], difficulty: ["intermediate"] },
  },
  {
    slug: "incline-dumbbell-press",
    name: "Incline Dumbbell Press",
    primaryMuscle: "Upper Chest",
    equipmentLabel: "Dumbbell",
    difficulty: "Beginner",
    artwork: "generic",
    summary:
      "Biases the upper chest and lets each arm work independently through a longer range.",
    musclesWorked: {
      primary: ["Upper pectoralis major", "Anterior deltoid"],
      secondary: ["Triceps brachii"],
    },
    instructions: [
      "Set the bench to roughly 30 degrees — steeper than that turns it into a shoulder press.",
      "Kick the dumbbells to your shoulders as you lie back, palms facing forward.",
      "Lower until your elbows sit just below torso level, keeping your wrists stacked over them.",
      "Press up and slightly together, stopping just short of locking the dumbbells out.",
    ],
    mistakes: [
      {
        title: "Setting the bench too steep",
        detail: "Past 45 degrees the front delts take over and the chest stops working.",
      },
      {
        title: "Clanging the dumbbells together at the top",
        detail: "It unloads the chest at the exact moment you want tension.",
      },
      {
        title: "Cutting the range short",
        detail: "The stretch at the bottom is where most of the growth stimulus lives.",
      },
    ],
    tips: [
      "Start lighter than your flat-bench numbers suggest — the angle is deceptively hard.",
      "Keep your feet planted and ribs down so the bench does not turn into a decline press.",
      "Pause for a beat at the bottom to remove momentum entirely.",
    ],
    prescription: [
      { goal: "Strength", sets: "4", reps: "5–6", rest: "2 min" },
      { goal: "Hypertrophy", sets: "3–4", reps: "8–12", rest: "90 s" },
      { goal: "Endurance", sets: "2–3", reps: "15", rest: "45 s" },
    ],
    alternatives: ["barbell-bench-press", "push-up", "overhead-press"],
    facets: { muscle: ["chest"], equipment: ["dumbbell"], difficulty: ["beginner"] },
  },
  {
    slug: "push-up",
    name: "Push-Up",
    primaryMuscle: "Chest",
    equipmentLabel: "Bodyweight",
    difficulty: "Beginner",
    artwork: "athlete",
    summary:
      "A full-body press that trains the chest and triceps while demanding real trunk control.",
    musclesWorked: {
      primary: ["Pectoralis major", "Triceps brachii"],
      secondary: ["Anterior deltoid", "Core", "Serratus anterior"],
    },
    instructions: [
      "Set your hands slightly wider than your shoulders with your fingers spread.",
      "Squeeze your glutes and brace so your body forms one straight line from head to heels.",
      "Lower your chest to within a fist of the floor, elbows tracking back at around 45 degrees.",
      "Press the floor away and finish by pushing your upper back apart at the top.",
    ],
    mistakes: [
      {
        title: "Hips sagging toward the floor",
        detail: "The set becomes a lower-back exercise. Brace first, then start the rep.",
      },
      {
        title: "Head leading the descent",
        detail: "Chin should stay tucked; your chest touches first, not your face.",
      },
      {
        title: "Half reps to chase a number",
        detail: "Fewer full-range reps beat twenty partials every time.",
      },
    ],
    tips: [
      "Too hard? Elevate your hands on a bench. Too easy? Elevate your feet or slow the lowering.",
      "Three seconds down, one second up is the fastest way to make bodyweight feel heavy.",
      "Stop two reps short of failure on every set except the last.",
    ],
    prescription: [
      { goal: "Strength", sets: "4", reps: "6–8 weighted", rest: "2 min" },
      { goal: "Hypertrophy", sets: "3–4", reps: "10–15", rest: "75 s" },
      { goal: "Endurance", sets: "3", reps: "AMRAP", rest: "60 s" },
    ],
    alternatives: ["barbell-bench-press", "incline-dumbbell-press", "close-grip-bench-press"],
    facets: { muscle: ["chest", "triceps"], equipment: ["bodyweight"], difficulty: ["beginner"] },
  },
  {
    slug: "lat-pulldown",
    name: "Lat Pulldown",
    primaryMuscle: "Back",
    equipmentLabel: "Cable",
    difficulty: "Beginner",
    artwork: "generic",
    summary:
      "The most approachable way to train a vertical pull and build width through the lats.",
    musclesWorked: {
      primary: ["Latissimus dorsi", "Teres major"],
      secondary: ["Biceps brachii", "Rear deltoid", "Middle trapezius"],
    },
    instructions: [
      "Set the thigh pad tight enough that your hips stay down when you pull.",
      "Take a grip just outside shoulder width and sit tall with a slight backward lean.",
      "Pull your elbows down toward your ribs until the bar reaches your collarbone.",
      "Control the bar back up until your lats are fully lengthened before the next rep.",
    ],
    mistakes: [
      {
        title: "Pulling behind the neck",
        detail: "It forces the shoulder into external rotation under load for no extra benefit.",
      },
      {
        title: "Rowing with the whole torso",
        detail: "If your body swings more than a few degrees, the lats have stopped working.",
      },
      {
        title: "Gripping too wide",
        detail: "A very wide grip shortens the range without recruiting any more lat tissue.",
      },
    ],
    tips: [
      "Think about driving your elbows into your back pockets, not pulling with your hands.",
      "Pause for one second at the bottom of each rep to kill momentum.",
      "Switch between wide, neutral and underhand grips across a training block.",
    ],
    prescription: [
      { goal: "Strength", sets: "4", reps: "6–8", rest: "2 min" },
      { goal: "Hypertrophy", sets: "3–4", reps: "10–12", rest: "75 s" },
      { goal: "Endurance", sets: "2–3", reps: "15–20", rest: "45 s" },
    ],
    alternatives: ["chin-up", "barbell-row"],
    facets: { muscle: ["back"], equipment: ["cable"], difficulty: ["beginner"] },
  },
  {
    slug: "barbell-row",
    name: "Barbell Row",
    primaryMuscle: "Back",
    equipmentLabel: "Barbell",
    difficulty: "Intermediate",
    artwork: "program",
    summary:
      "Heavy horizontal pulling that builds mid-back thickness and reinforces your hinge position.",
    musclesWorked: {
      primary: ["Latissimus dorsi", "Rhomboids", "Middle trapezius"],
      secondary: ["Biceps brachii", "Erector spinae", "Rear deltoid"],
    },
    instructions: [
      "Hinge until your torso is around 15 degrees above parallel, bar hanging under your shoulders.",
      "Take a grip just outside your knees and pull the slack out of the bar.",
      "Row the bar to your lower ribs, leading with your elbows and keeping your neck neutral.",
      "Lower under control to full arm extension without letting your chest drop.",
    ],
    mistakes: [
      {
        title: "Standing up rep by rep",
        detail: "Torso angle should be identical on the first and last rep of the set.",
      },
      {
        title: "Rowing to the chest",
        detail: "Pulling too high turns it into a rear-delt raise and stresses the shoulder.",
      },
      {
        title: "Rounding the lower back",
        detail: "Reduce the load until you can brace and hold a neutral spine throughout.",
      },
    ],
    tips: [
      "Set up with the bar over mid-foot so it travels in a straight vertical line.",
      "If your lower back fatigues before your back does, use a chest-supported row instead.",
      "Straps are fine on your heaviest sets — grip should not cap back training.",
    ],
    prescription: [
      { goal: "Strength", sets: "4–5", reps: "5–6", rest: "2–3 min" },
      { goal: "Hypertrophy", sets: "3–4", reps: "8–12", rest: "90 s" },
      { goal: "Endurance", sets: "3", reps: "15", rest: "60 s" },
    ],
    alternatives: ["lat-pulldown", "chin-up"],
    facets: { muscle: ["back"], equipment: ["barbell"], difficulty: ["intermediate"] },
  },
  {
    slug: "chin-up",
    name: "Chin-Up",
    primaryMuscle: "Back / Biceps",
    equipmentLabel: "Bodyweight",
    difficulty: "Advanced",
    artwork: "athlete",
    summary:
      "The hardest honest measure of relative upper-body strength, and the best biceps builder there is.",
    musclesWorked: {
      primary: ["Latissimus dorsi", "Biceps brachii"],
      secondary: ["Brachialis", "Middle trapezius", "Core"],
    },
    instructions: [
      "Hang from the bar with an underhand grip at shoulder width and arms fully extended.",
      "Set your shoulders by pulling your blades down before your elbows bend.",
      "Pull until your collarbone reaches the bar, keeping your ribs down and legs still.",
      "Lower all the way to a full hang under control — no dropping off the bar.",
    ],
    mistakes: [
      {
        title: "Kipping to finish the set",
        detail: "Once the legs swing the set is over. Switch to assisted reps instead.",
      },
      {
        title: "Stopping at chin height",
        detail: "Chest to bar is the standard; partial reps train a partial range.",
      },
      {
        title: "Skipping the dead hang",
        detail: "The bottom stretch is where the lats do their most useful work.",
      },
    ],
    tips: [
      "Can't do one yet? Do slow 5-second lowerings from the top three times a week.",
      "Add load with a belt once you can complete eight clean reps.",
      "Keep total weekly volume modest — elbows complain before lats do.",
    ],
    prescription: [
      { goal: "Strength", sets: "4–5", reps: "3–5 weighted", rest: "3 min" },
      { goal: "Hypertrophy", sets: "3–4", reps: "6–10", rest: "2 min" },
      { goal: "Endurance", sets: "3", reps: "AMRAP", rest: "90 s" },
    ],
    alternatives: ["lat-pulldown", "barbell-row", "dumbbell-curl"],
    facets: {
      muscle: ["back", "biceps"],
      equipment: ["bodyweight"],
      difficulty: ["advanced"],
    },
  },
  {
    slug: "overhead-press",
    name: "Overhead Press",
    primaryMuscle: "Shoulders",
    equipmentLabel: "Barbell",
    difficulty: "Intermediate",
    artwork: "program",
    summary:
      "Standing vertical press that builds shoulder size and exposes any weakness in your bracing.",
    musclesWorked: {
      primary: ["Anterior deltoid", "Lateral deltoid"],
      secondary: ["Triceps brachii", "Upper trapezius", "Core"],
    },
    instructions: [
      "Rack the bar on your front delts with your elbows slightly ahead of the bar.",
      "Squeeze your glutes and brace hard — the ribcage should not flare.",
      "Press the bar up, moving your head back just enough to clear a straight path.",
      "Finish with the bar stacked over mid-foot and your head through the window.",
    ],
    mistakes: [
      {
        title: "Leaning back to start the press",
        detail: "It turns the lift into a standing incline press and loads the lumbar spine.",
      },
      {
        title: "Pressing around the head",
        detail: "A curved bar path wastes force. Move your head, not the bar.",
      },
      {
        title: "Soft glutes and ribs",
        detail: "Without a braced trunk you will leak force at the sticking point every time.",
      },
    ],
    tips: [
      "Start each rep from a dead stop on the shoulders rather than bouncing out of the bottom.",
      "If your shoulders pinch, try a slightly narrower grip or switch to dumbbells.",
      "Press with your legs locked — save push-press variations for a dedicated power block.",
    ],
    prescription: [
      { goal: "Strength", sets: "5", reps: "3–5", rest: "3 min" },
      { goal: "Hypertrophy", sets: "3–4", reps: "6–10", rest: "2 min" },
      { goal: "Endurance", sets: "3", reps: "12–15", rest: "60 s" },
    ],
    alternatives: ["dumbbell-lateral-raise", "incline-dumbbell-press"],
    facets: {
      muscle: ["shoulders"],
      equipment: ["barbell"],
      difficulty: ["intermediate"],
    },
  },
  {
    slug: "dumbbell-lateral-raise",
    name: "Dumbbell Lateral Raise",
    primaryMuscle: "Shoulders",
    equipmentLabel: "Dumbbell",
    difficulty: "Beginner",
    artwork: "generic",
    summary:
      "The most direct way to train the side delt — the muscle that actually makes shoulders look wide.",
    musclesWorked: {
      primary: ["Lateral deltoid"],
      secondary: ["Anterior deltoid", "Upper trapezius"],
    },
    instructions: [
      "Stand tall with a light dumbbell in each hand, elbows very slightly bent.",
      "Raise your arms out to the sides, leading with your elbows rather than your hands.",
      "Stop level with your shoulders — higher than that hands the work to the traps.",
      "Lower slowly over two to three seconds, resisting the whole way down.",
    ],
    mistakes: [
      {
        title: "Going too heavy",
        detail: "If your torso swings, the side delt has already stopped being the prime mover.",
      },
      {
        title: "Shrugging at the top",
        detail: "Keep your shoulders down and away from your ears through the whole range.",
      },
      {
        title: "Dropping the weights back down",
        detail: "The lowering phase is half the set — control it deliberately.",
      },
    ],
    tips: [
      "Lean slightly against a bench to remove momentum entirely.",
      "Pause for one second at the top of every rep.",
      "This is a high-rep movement — 12 to 20 reps is the sweet spot.",
    ],
    prescription: [
      { goal: "Strength", sets: "3", reps: "10–12", rest: "90 s" },
      { goal: "Hypertrophy", sets: "3–4", reps: "12–20", rest: "60 s" },
      { goal: "Endurance", sets: "3", reps: "20–25", rest: "45 s" },
    ],
    alternatives: ["overhead-press", "incline-dumbbell-press"],
    facets: { muscle: ["shoulders"], equipment: ["dumbbell"], difficulty: ["beginner"] },
  },
  {
    slug: "dumbbell-curl",
    name: "Dumbbell Curl",
    primaryMuscle: "Biceps",
    equipmentLabel: "Dumbbell",
    difficulty: "Beginner",
    artwork: "generic",
    summary:
      "Simple, scalable biceps work with a free range of motion at the wrist and shoulder.",
    musclesWorked: {
      primary: ["Biceps brachii"],
      secondary: ["Brachialis", "Brachioradialis", "Forearm flexors"],
    },
    instructions: [
      "Stand with a dumbbell in each hand, arms straight, palms facing forward.",
      "Curl one or both dumbbells up while keeping your elbows pinned at your sides.",
      "Squeeze at the top without letting the elbow drift forward.",
      "Lower all the way to a straight arm before starting the next rep.",
    ],
    mistakes: [
      {
        title: "Swinging the torso",
        detail: "Momentum robs the biceps of exactly the tension you are trying to create.",
      },
      {
        title: "Elbows drifting forward",
        detail: "Once the elbow travels, the front delt takes over the top half of the rep.",
      },
      {
        title: "Stopping short at the bottom",
        detail: "Full extension between reps is where the long head gets loaded.",
      },
    ],
    tips: [
      "Alternate arms to keep quality high once fatigue sets in.",
      "Supinate as you curl — rotating the palm up adds tension at the top.",
      "Biceps recover quickly; two or three sessions a week is well tolerated.",
    ],
    prescription: [
      { goal: "Strength", sets: "3", reps: "6–8", rest: "90 s" },
      { goal: "Hypertrophy", sets: "3–4", reps: "10–15", rest: "60 s" },
      { goal: "Endurance", sets: "2–3", reps: "20", rest: "45 s" },
    ],
    alternatives: ["chin-up", "lat-pulldown"],
    facets: { muscle: ["biceps"], equipment: ["dumbbell"], difficulty: ["beginner"] },
  },
  {
    slug: "cable-triceps-pushdown",
    name: "Cable Triceps Pushdown",
    primaryMuscle: "Triceps",
    equipmentLabel: "Cable",
    difficulty: "Beginner",
    artwork: "generic",
    summary:
      "Constant-tension triceps work that is easy to load precisely and kind to the elbows.",
    musclesWorked: {
      primary: ["Triceps brachii"],
      secondary: ["Anconeus", "Forearm extensors"],
    },
    instructions: [
      "Set the pulley just above head height and take a rope or straight bar attachment.",
      "Stand close with a slight forward lean and pin your elbows to your ribs.",
      "Push down until your arms are fully straight, spreading the rope at the bottom.",
      "Let the weight return until your forearms pass parallel, keeping the elbows still.",
    ],
    mistakes: [
      {
        title: "Elbows travelling backward",
        detail: "It recruits the lats and shortens the triceps' working range.",
      },
      {
        title: "Leaning in to push more weight",
        detail: "If bodyweight is finishing the rep, drop the load a plate.",
      },
      {
        title: "Stopping halfway up",
        detail: "The stretched position matters — let the forearms come past parallel.",
      },
    ],
    tips: [
      "A rope attachment allows a fuller contraction than a straight bar.",
      "Keep reps in the 10 to 15 range — heavy pushdowns tend to irritate elbows.",
      "Pair with a stretch-biased movement like an overhead extension for full coverage.",
    ],
    prescription: [
      { goal: "Strength", sets: "3", reps: "8–10", rest: "90 s" },
      { goal: "Hypertrophy", sets: "3–4", reps: "12–15", rest: "60 s" },
      { goal: "Endurance", sets: "3", reps: "20", rest: "45 s" },
    ],
    alternatives: ["close-grip-bench-press", "push-up"],
    facets: { muscle: ["triceps"], equipment: ["cable"], difficulty: ["beginner"] },
  },
  {
    slug: "close-grip-bench-press",
    name: "Close-Grip Bench Press",
    primaryMuscle: "Triceps",
    equipmentLabel: "Barbell",
    difficulty: "Intermediate",
    artwork: "program",
    summary:
      "The heaviest triceps movement available, and the most direct carryover to a bigger bench.",
    musclesWorked: {
      primary: ["Triceps brachii", "Pectoralis major"],
      secondary: ["Anterior deltoid"],
    },
    instructions: [
      "Grip the bar at roughly shoulder width — narrower than that strains the wrists.",
      "Set your shoulder blades back and down and unrack the bar over your shoulders.",
      "Lower to your lower chest with your elbows tucked close to your torso.",
      "Press back up, thinking about straightening your arms rather than moving the bar.",
    ],
    mistakes: [
      {
        title: "Gripping inside shoulder width",
        detail: "It loads the wrists and elbows without adding any triceps stimulus.",
      },
      {
        title: "Letting the elbows flare",
        detail: "Flaring shifts the work to the chest and defeats the purpose of the variation.",
      },
      {
        title: "Treating it like a max-effort lift every week",
        detail: "Elbows tolerate frequency better than they tolerate constant maximal load.",
      },
    ],
    tips: [
      "Expect 15 to 20 percent less weight than your regular bench press.",
      "A brief pause on the chest removes the bounce and exposes the true sticking point.",
      "Excellent as the second press of a session rather than the first.",
    ],
    prescription: [
      { goal: "Strength", sets: "4", reps: "4–6", rest: "2–3 min" },
      { goal: "Hypertrophy", sets: "3–4", reps: "8–10", rest: "90 s" },
      { goal: "Endurance", sets: "3", reps: "12–15", rest: "60 s" },
    ],
    alternatives: ["cable-triceps-pushdown", "barbell-bench-press", "push-up"],
    facets: {
      muscle: ["triceps", "chest"],
      equipment: ["barbell"],
      difficulty: ["intermediate"],
    },
  },
  {
    slug: "back-squat",
    name: "Back Squat",
    primaryMuscle: "Quads / Glutes",
    equipmentLabel: "Barbell",
    difficulty: "Advanced",
    artwork: "athlete",
    summary:
      "The heaviest lower-body lift most people will ever do, and the fastest route to leg size.",
    musclesWorked: {
      primary: ["Quadriceps", "Gluteus maximus"],
      secondary: ["Adductors", "Erector spinae", "Hamstrings"],
    },
    instructions: [
      "Set the bar across your upper traps or rear delts and grip it as narrowly as comfort allows.",
      "Unrack, take two steps back and set your feet just outside shoulder width, toes slightly out.",
      "Take a deep breath into your belly, brace, and sit down between your hips.",
      "Descend until your hip crease passes your knee, then drive up through your whole foot.",
    ],
    mistakes: [
      {
        title: "Knees collapsing inward",
        detail: "Push your knees out over your toes as you stand — usually a bracing issue, not weakness.",
      },
      {
        title: "Hips shooting up first",
        detail: "That turns a squat into a good morning. Slow the descent and lead with the chest.",
      },
      {
        title: "Losing the brace at the bottom",
        detail: "Hold your breath through the hardest third of the rep, then exhale.",
      },
    ],
    tips: [
      "Always squat in a rack with the safety pins set just below your bottom position.",
      "Film a set from the side every few weeks — depth drifts without you noticing.",
      "If mobility limits depth, start with goblet squats and earn the bar.",
    ],
    prescription: [
      { goal: "Strength", sets: "5", reps: "3–5", rest: "3–5 min" },
      { goal: "Hypertrophy", sets: "4", reps: "6–10", rest: "2–3 min" },
      { goal: "Endurance", sets: "3", reps: "15–20", rest: "90 s" },
    ],
    alternatives: ["goblet-squat", "leg-press", "hip-thrust"],
    facets: { muscle: ["legs", "glutes"], equipment: ["barbell"], difficulty: ["advanced"] },
  },
  {
    slug: "goblet-squat",
    name: "Goblet Squat",
    primaryMuscle: "Quads / Glutes",
    equipmentLabel: "Dumbbell",
    difficulty: "Beginner",
    artwork: "generic",
    summary:
      "The best squat to learn on. The front-loaded weight teaches an upright torso automatically.",
    musclesWorked: {
      primary: ["Quadriceps", "Gluteus maximus"],
      secondary: ["Core", "Adductors", "Upper back"],
    },
    instructions: [
      "Hold a dumbbell or kettlebell vertically against your chest with both hands.",
      "Stand with your feet just outside shoulder width and your toes slightly turned out.",
      "Squat down between your knees, keeping your elbows inside your thighs.",
      "Stand back up without letting the weight drift away from your sternum.",
    ],
    mistakes: [
      {
        title: "Letting the weight pull you forward",
        detail: "Keep it pinned to your chest; the moment it drifts, your back rounds.",
      },
      {
        title: "Heels lifting off the floor",
        detail: "Widen your stance slightly or elevate your heels while ankle mobility improves.",
      },
      {
        title: "Rushing the bottom",
        detail: "A one-second pause at depth builds control that transfers to barbell squats.",
      },
    ],
    tips: [
      "This is the ideal warm-up movement before heavy squats or deadlifts.",
      "Higher reps suit it well — it usually runs out of load before it runs out of value.",
      "Keep your ribs stacked over your pelvis rather than flared open.",
    ],
    prescription: [
      { goal: "Strength", sets: "3–4", reps: "8", rest: "2 min" },
      { goal: "Hypertrophy", sets: "3–4", reps: "10–15", rest: "75 s" },
      { goal: "Endurance", sets: "3", reps: "20", rest: "45 s" },
    ],
    alternatives: ["back-squat", "leg-press", "box-jump"],
    facets: { muscle: ["legs", "glutes"], equipment: ["dumbbell"], difficulty: ["beginner"] },
  },
  {
    slug: "leg-press",
    name: "Leg Press",
    primaryMuscle: "Quads",
    equipmentLabel: "Machine",
    difficulty: "Beginner",
    artwork: "generic",
    summary:
      "Heavy quad loading with a fixed path, so you can push close to failure safely and alone.",
    musclesWorked: {
      primary: ["Quadriceps"],
      secondary: ["Gluteus maximus", "Adductors", "Hamstrings"],
    },
    instructions: [
      "Sit with your back and hips flat against the pad and your feet mid-platform, shoulder width.",
      "Release the safeties and lower the sled until your knees reach roughly 90 degrees.",
      "Press through your whole foot until your legs are almost straight.",
      "Stop just short of locking your knees out and begin the next rep.",
    ],
    mistakes: [
      {
        title: "Lower back rounding off the pad",
        detail: "Going too deep tilts the pelvis. Shorten the range until your hips stay planted.",
      },
      {
        title: "Slamming into lockout",
        detail: "Hyperextending under load is the fastest way to irritate a knee.",
      },
      {
        title: "Hands on the knees",
        detail: "Hold the handles — pushing your knees hides how much the legs are actually doing.",
      },
    ],
    tips: [
      "Feet higher on the platform shifts work toward glutes and hamstrings; lower targets quads.",
      "Because failure is safe here, it is the best place to take a set to the limit.",
      "Keep the tempo honest — three seconds down beats another plate on the sled.",
    ],
    prescription: [
      { goal: "Strength", sets: "4", reps: "6–8", rest: "2–3 min" },
      { goal: "Hypertrophy", sets: "3–4", reps: "10–15", rest: "90 s" },
      { goal: "Endurance", sets: "3", reps: "20–25", rest: "60 s" },
    ],
    alternatives: ["back-squat", "goblet-squat"],
    facets: { muscle: ["legs"], equipment: ["machine"], difficulty: ["beginner"] },
  },
  {
    slug: "box-jump",
    name: "Box Jump",
    primaryMuscle: "Legs",
    equipmentLabel: "Bodyweight",
    difficulty: "Intermediate",
    artwork: "athlete",
    summary:
      "Trains rate of force development — how fast you can express the strength you already have.",
    musclesWorked: {
      primary: ["Quadriceps", "Gluteus maximus", "Calves"],
      secondary: ["Hamstrings", "Core"],
    },
    instructions: [
      "Stand a forearm's length from a box you can land on with your feet flat.",
      "Dip quickly to a quarter squat while swinging your arms back.",
      "Jump up and forward, driving your arms to accelerate the take-off.",
      "Land softly in a quarter-squat with your whole foot down, then step — never jump — back off.",
    ],
    mistakes: [
      {
        title: "Choosing a box that is too tall",
        detail: "Height achieved by tucking your knees to your chest trains nothing but flexibility.",
      },
      {
        title: "Jumping back down",
        detail: "The landing impact from a box is far higher than the jump itself. Step down.",
      },
      {
        title: "Doing them for conditioning",
        detail: "Fatigued jumps are slow jumps. Rest fully between every set.",
      },
    ],
    tips: [
      "Quality over quantity — three to five crisp reps per set is plenty.",
      "Place jumps at the very start of a session, before any heavy lifting.",
      "If the landing is loud, the box is too high.",
    ],
    prescription: [
      { goal: "Power", sets: "4–5", reps: "3", rest: "2–3 min" },
      { goal: "Athleticism", sets: "3–4", reps: "5", rest: "2 min" },
      { goal: "Warm-up", sets: "2", reps: "3", rest: "60 s" },
    ],
    alternatives: ["back-squat", "kettlebell-swing"],
    facets: { muscle: ["legs"], equipment: ["bodyweight"], difficulty: ["intermediate"] },
  },
  {
    slug: "romanian-deadlift",
    name: "Romanian Deadlift",
    primaryMuscle: "Hamstrings / Glutes",
    equipmentLabel: "Barbell",
    difficulty: "Intermediate",
    artwork: "program",
    summary:
      "The definitive hinge. Loads the hamstrings in a stretched position and bulletproofs the posterior chain.",
    musclesWorked: {
      primary: ["Hamstrings", "Gluteus maximus"],
      secondary: ["Erector spinae", "Lats", "Forearms"],
    },
    instructions: [
      "Stand holding a barbell at hip height with a shoulder-width grip and soft knees.",
      "Push your hips straight back, letting the bar travel down your thighs in contact with your legs.",
      "Stop when you feel a strong hamstring stretch, usually just below the knee.",
      "Drive your hips forward to stand, finishing with your glutes squeezed and ribs down.",
    ],
    mistakes: [
      {
        title: "Squatting the weight down",
        detail: "Excessive knee bend turns it into a deadlift. The knee angle should barely change.",
      },
      {
        title: "Letting the bar drift away",
        detail: "Every inch off your legs multiplies the load on your lower back.",
      },
      {
        title: "Chasing depth past your range",
        detail: "Go only as low as you can with a flat back, even if that stops above the knee.",
      },
    ],
    tips: [
      "Think about pushing the wall behind you away with your hips.",
      "Slow the lowering to three seconds — this movement responds to time under tension.",
      "Use straps once grip becomes the limiting factor.",
    ],
    prescription: [
      { goal: "Strength", sets: "4", reps: "5–6", rest: "2–3 min" },
      { goal: "Hypertrophy", sets: "3–4", reps: "8–12", rest: "90 s" },
      { goal: "Endurance", sets: "3", reps: "15", rest: "60 s" },
    ],
    alternatives: ["hip-thrust", "kettlebell-swing", "back-squat"],
    facets: {
      muscle: ["glutes", "legs"],
      equipment: ["barbell"],
      difficulty: ["intermediate"],
    },
  },
  {
    slug: "hip-thrust",
    name: "Hip Thrust",
    primaryMuscle: "Glutes",
    equipmentLabel: "Barbell",
    difficulty: "Intermediate",
    artwork: "program",
    summary:
      "Loads the glutes hardest exactly where they are strongest — full hip extension.",
    musclesWorked: {
      primary: ["Gluteus maximus"],
      secondary: ["Hamstrings", "Quadriceps", "Core"],
    },
    instructions: [
      "Sit on the floor with your upper back against a bench and a padded bar over your hips.",
      "Plant your feet so your shins are vertical at the top of the movement.",
      "Tuck your chin, brace, and drive your hips up until your torso is parallel to the floor.",
      "Squeeze for a beat at the top, then lower under control without resting the bar down.",
    ],
    mistakes: [
      {
        title: "Hyperextending the lower back",
        detail: "The finish should come from the glutes, not from arching the spine.",
      },
      {
        title: "Feet too far forward",
        detail: "It hands the work to the hamstrings. Vertical shins at lockout is the cue.",
      },
      {
        title: "Rushing the top",
        detail: "A full one-second squeeze at lockout is where this exercise earns its keep.",
      },
    ],
    tips: [
      "Use a proper bar pad — comfort is the main limiter on heavy sets.",
      "Keep your ribs down and your gaze forward through the whole rep.",
      "Pairs well after squats when the quads are already fatigued.",
    ],
    prescription: [
      { goal: "Strength", sets: "4", reps: "6–8", rest: "2 min" },
      { goal: "Hypertrophy", sets: "3–4", reps: "10–12", rest: "90 s" },
      { goal: "Endurance", sets: "3", reps: "15–20", rest: "60 s" },
    ],
    alternatives: ["romanian-deadlift", "kettlebell-swing", "back-squat"],
    facets: {
      muscle: ["glutes"],
      equipment: ["barbell"],
      difficulty: ["intermediate"],
    },
  },
  {
    slug: "kettlebell-swing",
    name: "Kettlebell Swing",
    primaryMuscle: "Glutes / Hamstrings",
    equipmentLabel: "Kettlebell",
    difficulty: "Intermediate",
    artwork: "athlete",
    summary:
      "A ballistic hinge that builds hip power and conditioning in the same set.",
    musclesWorked: {
      primary: ["Gluteus maximus", "Hamstrings"],
      secondary: ["Core", "Lats", "Forearms"],
    },
    instructions: [
      "Set the bell a foot in front of you, hinge, and hike it back between your legs.",
      "Snap your hips forward hard, letting the bell float up to chest height on its own.",
      "Keep your arms relaxed — they are ropes, not levers.",
      "Guide the bell back down and absorb it with another hinge, straight into the next rep.",
    ],
    mistakes: [
      {
        title: "Squatting instead of hinging",
        detail: "The bell should travel back through your legs, not down toward the floor.",
      },
      {
        title: "Lifting with the arms",
        detail: "If your shoulders are working, the hips are not snapping hard enough.",
      },
      {
        title: "Overswinging above the head",
        detail: "Chest height is the ceiling for a standard swing. Higher adds risk, not benefit.",
      },
    ],
    tips: [
      "Work in short timed sets — 20 to 30 seconds — with equal rest.",
      "Exhale sharply at the top of every rep to reinforce the brace.",
      "Go heavier than feels natural; a light bell encourages arm-lifting.",
    ],
    prescription: [
      { goal: "Power", sets: "6", reps: "10", rest: "60 s" },
      { goal: "Conditioning", sets: "6–8", reps: "20–30 s", rest: "40 s" },
      { goal: "Endurance", sets: "4", reps: "20", rest: "45 s" },
    ],
    alternatives: ["romanian-deadlift", "hip-thrust", "box-jump"],
    facets: {
      muscle: ["glutes", "legs"],
      equipment: ["kettlebell"],
      difficulty: ["intermediate"],
    },
  },
  {
    slug: "plank",
    name: "Plank",
    primaryMuscle: "Core",
    equipmentLabel: "Bodyweight",
    difficulty: "Beginner",
    artwork: "generic",
    summary:
      "Trains the core to resist extension — the job it actually does under a heavy bar.",
    musclesWorked: {
      primary: ["Rectus abdominis", "Transverse abdominis"],
      secondary: ["Obliques", "Gluteus maximus", "Shoulders"],
    },
    instructions: [
      "Set your elbows directly under your shoulders and your forearms parallel.",
      "Extend your legs back with your feet at hip width and your toes tucked.",
      "Squeeze your glutes and tuck your pelvis slightly so your lower back flattens.",
      "Hold, breathing shallowly through your nose, until form breaks — then stop.",
    ],
    mistakes: [
      {
        title: "Hips drifting up",
        detail: "A high hip position turns it into a rest. Keep a straight line from head to heels.",
      },
      {
        title: "Holding for time at any cost",
        detail: "Thirty hard seconds beats two soft minutes. Quality ends the set, not the clock.",
      },
      {
        title: "Holding your breath",
        detail: "You should be able to talk — if you cannot, you are bracing with your diaphragm.",
      },
    ],
    tips: [
      "Add difficulty with a weight plate on your back rather than more time.",
      "Reaching one arm forward at a time makes it substantially harder.",
      "Use it as a warm-up primer before squats and deadlifts.",
    ],
    prescription: [
      { goal: "Strength", sets: "3–4", reps: "20–30 s weighted", rest: "60 s" },
      { goal: "Control", sets: "3", reps: "45 s", rest: "45 s" },
      { goal: "Endurance", sets: "3", reps: "60 s", rest: "30 s" },
    ],
    alternatives: ["hanging-leg-raise", "push-up"],
    facets: { muscle: ["core"], equipment: ["bodyweight"], difficulty: ["beginner"] },
  },
  {
    slug: "hanging-leg-raise",
    name: "Hanging Leg Raise",
    primaryMuscle: "Core",
    equipmentLabel: "Bodyweight",
    difficulty: "Advanced",
    artwork: "athlete",
    summary:
      "The hardest bodyweight abdominal movement, and a serious test of grip and shoulder control.",
    musclesWorked: {
      primary: ["Rectus abdominis", "Hip flexors"],
      secondary: ["Obliques", "Lats", "Forearms"],
    },
    instructions: [
      "Hang from a bar with an overhand grip and your shoulders actively pulled down.",
      "Brace, then raise your legs by curling your pelvis toward your ribs.",
      "Continue until your thighs pass parallel, keeping your legs straight if you can.",
      "Lower slowly with no swing, stopping the moment the body starts to rock.",
    ],
    mistakes: [
      {
        title: "Swinging between reps",
        detail: "Momentum removes the abs from the movement entirely. Reset in a dead hang.",
      },
      {
        title: "Only lifting the knees",
        detail: "Without the pelvic curl it is a hip-flexor exercise, not an ab exercise.",
      },
      {
        title: "Hanging passively",
        detail: "Keep the shoulders packed — a loose hang stresses the shoulder capsule.",
      },
    ],
    tips: [
      "Start with bent-knee raises and straighten the legs as control improves.",
      "Use straps if grip gives out before the abs do.",
      "Pause for one second at the top of every rep.",
    ],
    prescription: [
      { goal: "Strength", sets: "4", reps: "6–8", rest: "2 min" },
      { goal: "Hypertrophy", sets: "3–4", reps: "10–12", rest: "90 s" },
      { goal: "Endurance", sets: "3", reps: "15", rest: "60 s" },
    ],
    alternatives: ["plank", "chin-up"],
    facets: { muscle: ["core"], equipment: ["bodyweight"], difficulty: ["advanced"] },
  },
  {
    slug: "seated-shoulder-press",
    name: "Seated Shoulder Press",
    primaryMuscle: "Shoulders",
    equipmentLabel: "Dumbbell",
    difficulty: "Beginner",
    artwork: "generic",
    summary:
      "A supported vertical press that lets you train the delts hard without taxing the trunk.",
    musclesWorked: {
      primary: ["Anterior deltoid", "Lateral deltoid"],
      secondary: ["Triceps brachii", "Upper trapezius"],
    },
    instructions: [
      "Set an upright bench and sit with your back flat against the pad.",
      "Bring two dumbbells to shoulder height with your palms facing forward.",
      "Press overhead until your arms are almost straight, without locking out hard.",
      "Lower under control until your elbows drop just below shoulder height.",
    ],
    mistakes: [
      {
        title: "Arching off the bench",
        detail: "If your lower back leaves the pad, the weight is too heavy for a seated press.",
      },
      {
        title: "Pressing the dumbbells together",
        detail: "Clashing them at the top unloads the delts and risks trapping a finger.",
      },
      {
        title: "Stopping the descent too high",
        detail: "Elbows should pass shoulder level to load the full range.",
      },
    ],
    tips: [
      "Keep your ribs down and your core braced even though you are seated.",
      "Neutral-grip dumbbells are a good swap if your shoulders complain.",
      "Because the bench supports you, this is a safe place to push close to failure.",
    ],
    prescription: [
      { goal: "Strength", sets: "4", reps: "6–8", rest: "2 min" },
      { goal: "Hypertrophy", sets: "3–4", reps: "10–12", rest: "90 s" },
      { goal: "Endurance", sets: "3", reps: "15", rest: "60 s" },
    ],
    alternatives: ["overhead-press", "dumbbell-lateral-raise", "incline-dumbbell-press"],
    facets: { muscle: ["shoulders"], equipment: ["dumbbell"], difficulty: ["beginner"] },
  },
  {
    slug: "cable-fly",
    name: "Cable Fly",
    primaryMuscle: "Chest",
    equipmentLabel: "Cable",
    difficulty: "Beginner",
    artwork: "generic",
    summary:
      "Isolates the chest with constant tension through a long arc that pressing cannot reach.",
    musclesWorked: {
      primary: ["Pectoralis major"],
      secondary: ["Anterior deltoid", "Serratus anterior"],
    },
    instructions: [
      "Set both pulleys at roughly shoulder height and take a handle in each hand.",
      "Step forward into a split stance with a slight forward lean and soft elbows.",
      "Bring your hands together in front of your sternum, leading with your upper arms.",
      "Open slowly until you feel a stretch across the chest, keeping the elbow angle fixed.",
    ],
    mistakes: [
      {
        title: "Turning it into a press",
        detail: "If your elbows bend and straighten, you are pressing. Keep the angle locked.",
      },
      {
        title: "Going too heavy",
        detail: "Load that forces your torso to swing removes tension from the chest entirely.",
      },
      {
        title: "Opening too far",
        detail: "Stretch is good; pulling the shoulder into an end-range position is not.",
      },
    ],
    tips: [
      "Squeeze for a full second where your hands meet.",
      "Vary the pulley height across a block to bias upper, mid and lower chest.",
      "Best used after your heavy pressing, not before it.",
    ],
    prescription: [
      { goal: "Strength", sets: "3", reps: "10", rest: "90 s" },
      { goal: "Hypertrophy", sets: "3–4", reps: "12–15", rest: "60 s" },
      { goal: "Endurance", sets: "3", reps: "20", rest: "45 s" },
    ],
    alternatives: ["barbell-bench-press", "incline-dumbbell-press", "push-up"],
    facets: { muscle: ["chest"], equipment: ["cable"], difficulty: ["beginner"] },
  },
];

export function getExercise(slug: string): Exercise | undefined {
  return exercises.find((exercise) => exercise.slug === slug);
}

/** Resolves a workout's exercise name to a library entry, when one exists. */
export function findExerciseByName(name: string): Exercise | undefined {
  return exercises.find(
    (exercise) => exercise.name.toLowerCase() === name.toLowerCase(),
  );
}

export function getExercises(slugs: string[]): Exercise[] {
  return slugs
    .map((slug) => getExercise(slug))
    .filter((exercise): exercise is Exercise => Boolean(exercise));
}
