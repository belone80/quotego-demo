const {
  detectBusinessType,
  buildBusinessConfiguration
} = require("./business-template-engine");

const tests = [
  ["Je suis coiffeur et je veux gérer mes rendez-vous", "barber"],
  ["Je possède un restaurant à Bruxelles", "restaurant"],
  ["Je fais du detailing automobile", "detailing"],
  ["Je suis jardinier", "garden"],
  ["J'ai un institut de beauté", "beauty"],
  ["Je répare des vélos", "custom"]
];

let failed = 0;

for (const [input, expected] of tests) {
  const result = detectBusinessType(input);

  if (result.template.id !== expected) {
    console.error(`❌ ${input} -> ${result.template.id}, attendu ${expected}`);
    failed++;
  } else {
    console.log(`✅ ${input} -> ${result.template.id}`);
  }
}

console.log("\nExemple de configuration générée :");
console.log(
  JSON.stringify(
    buildBusinessConfiguration(
      "Je suis coiffeur et je propose coupe et barbe"
    ),
    null,
    2
  )
);

if (failed) process.exit(1);
