// ================================================================ glue: extra translations for shared lists
CHECKLIST.forEach((c,i)=>{AR[c[1]]=CHK_AR[i]});BOXES.forEach(b=>{AR[b.en]=b.ar});AR["Sections"]="الأقسام";
PAT.push([/^Box (\d+) ([ajv])$/,m=>`خانة ${m[1]} ${({a:"المبلغ",j:"التعديل",v:"الضريبة"})[m[2]]}`],
 [/^VAT IR Art\. (.+)$/,m=>`اللائحة التنفيذية، المادة ${m[1]}`],
 [/^VAT Law Art\. (.+)$/,m=>`نظام ضريبة القيمة المضافة، المادة ${m[1]}`]);
Object.assign(AR,{"ZATCA risk indicator":"مؤشر مخاطر لدى الهيئة","Analytics":"تحليلات","E-invoicing Regulation":"لائحة الفوترة الإلكترونية","VAT Law Art. 2 & 9":"نظام ضريبة القيمة المضافة، المادتان 2 و9"});
