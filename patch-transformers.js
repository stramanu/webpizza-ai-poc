const fs = require('fs');
const path = require('path');

// Rimuovi fisicamente i pacchetti problematici
const packagesToRemove = ['sharp', 'onnxruntime-node', 'detect-libc'];

packagesToRemove.forEach(pkg => {
  const pkgPath = path.join(__dirname, 'node_modules', pkg);
  if (fs.existsSync(pkgPath)) {
    fs.rmSync(pkgPath, { recursive: true, force: true });
    console.log(`🗑️  Removed ${pkg}`);
  }
});

// Patcha il package.json di transformers
const packageJsonPath = path.join(__dirname, 'node_modules', '@xenova', 'transformers', 'package.json');

if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Rimuovi le dipendenze opzionali problematiche
  if (packageJson.optionalDependencies) {
    delete packageJson.optionalDependencies.sharp;
    delete packageJson.optionalDependencies['onnxruntime-node'];
  }
  
  // Aggiungi browser field per ignorare questi moduli
  packageJson.browser = packageJson.browser || {};
  packageJson.browser.sharp = false;
  packageJson.browser['onnxruntime-node'] = false;
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Patched @xenova/transformers package.json');
} else {
  console.log('⚠️  @xenova/transformers not found in node_modules');
}
