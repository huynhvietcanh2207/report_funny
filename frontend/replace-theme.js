const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.vue') || file.endsWith('.css') || file.endsWith('.js')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'src'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Replace dark backgrounds
    content = content.replace(/#0a0a0a/gi, '#043130');
    content = content.replace(/#16171d/gi, '#034D36');
    content = content.replace(/#111111/gi, '#034D36');

    // Replace gradients and active colors with the palette
    // Light: #BDCCCF
    // Mid: #034D36
    // Dark: #043130

    // Overriding specific color text
    content = content.replace(/text-white/g, 'text-[#BDCCCF]');
    content = content.replace(/dark:text-white/g, 'dark:text-[#BDCCCF]');

    // Replace gradients
    content = content.replace(/from-teal-400/g, 'from-[#034D36]');
    content = content.replace(/from-teal-500/g, 'from-[#034D36]');
    content = content.replace(/from-purple-500/g, 'from-[#034D36]');
    content = content.replace(/from-rose-500/g, 'from-[#034D36]');

    content = content.replace(/to-purple-500/g, 'to-[#043130]');
    content = content.replace(/to-purple-600/g, 'to-[#043130]');
    content = content.replace(/to-indigo-600/g, 'to-[#043130]');
    content = content.replace(/to-red-500/g, 'to-[#043130]');
    content = content.replace(/to-red-600/g, 'to-[#043130]');

    // Background overlays
    content = content.replace(/bg-teal-500/g, 'bg-[#034D36]');
    content = content.replace(/bg-purple-500/g, 'bg-[#034D36]');
    content = content.replace(/bg-rose-500/g, 'bg-[#034D36]');

    content = content.replace(/hover:bg-teal-[45]00/g, 'hover:bg-[#034D36]');

    // Specific text overriding
    content = content.replace(/text-teal-400/g, 'text-[#BDCCCF]');
    content = content.replace(/text-teal-500/g, 'text-[#BDCCCF]');
    content = content.replace(/text-purple-400/g, 'text-[#BDCCCF]');
    content = content.replace(/text-purple-500/g, 'text-[#BDCCCF]');
    content = content.replace(/text-rose-400/g, 'text-[#BDCCCF]');
    content = content.replace(/text-rose-500/g, 'text-[#BDCCCF]');

    // Specific borders
    content = content.replace(/border-white\/10/g, 'border-[#BDCCCF]/20');
    content = content.replace(/border-white\/5/g, 'border-[#BDCCCF]/10');
    content = content.replace(/border-teal-500/g, 'border-[#034D36]');
    content = content.replace(/border-purple-500/g, 'border-[#034D36]');
    content = content.replace(/border-rose-500/g, 'border-[#034D36]');

    // Fill colors inside icons
    content = content.replace(/fill="currentColor"/g, 'fill="currentColor"');

    fs.writeFileSync(file, content);
});

console.log('Re-theming applied to all source files!');
