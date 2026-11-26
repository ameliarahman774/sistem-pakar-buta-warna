import { forwardChaining } from '../src/engine/forwardChaining.js';
import { ISHIHARA_PLATES } from '../src/data/ishiharaPlates.js';
const IDS = ['P01','P02','P04','P06','P08','P10','P11','P13','P15','P17','P19','P20','P22','P23','P24'];
const plates = IDS.map((id,i)=>({...ISHIHARA_PLATES.find(p=>p.id===id), nomor:i+1}));
const byNomor = {}; plates.forEach(p=>{ byNomor[p.nomor]=p; });
function jawab(gagalNomor){ const j={}; plates.forEach(p=>{ j[p.id]=gagalNomor.includes(p.nomor)?'tidak terlihat':p.angkaBenar; }); return j; }
const kasus = [
  ['Normal', [], [], 'NORMAL'],
  ['Protanopia', ['G01','G02','G04','G07','G08'], [2,3,4,5,6,7,8], 'PROTANOPIA'],
  ['Protanomaly', ['G01','G02'], [2,7], 'PROTANOMALY'],
  ['Deuteranopia', ['G01','G03','G05','G06','G09'], [2,3,4,5,6,9,10], 'DEUTERANOPIA'],
  ['Deuteranomaly', ['G01','G03','G09'], [2,3,9], 'DEUTERANOMALY'],
  ['Tritanopia', ['G11','G14','G15'], [11,12,13], 'TRITANOPIA'],
  ['Tritanomaly', ['G11','G14','G15'], [13], 'TRITANOMALY'],
  ['Achromatopsia', ['G16','G17','G18'], [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], 'ACHROMATOPSIA'],
];
for (const [nama, gejala, gagal, harap] of kasus){
  const h=forwardChaining({gejalaTerpilih:gejala, jawabanPlat:jawab(gagal), plates});
  console.log(`${h.diagnosis===harap?'OK':'GAGAL'}: ${nama} -> ${h.diagnosis} CF=${h.cfPersen}% (harap ${harap}) hipotesis=${h.hipotesis.map(x=>x.id+':'+Math.round(x.cf*100)).join(',')}`);
}
