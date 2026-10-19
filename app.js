const lessons = [
  {symbol:'#',name:'標題',title:'用 #，讓重點站出來。',description:'在行首加上 # 和一個空格。從一個到六個 #，分別對應六個標題層級。',source:'# 這是一級標題\n## 這是二級標題\n### 這是三級標題',tip:'記得在 # 與文字之間留一個空格。'},
  {symbol:'B',name:'文字強調',title:'把重要的事，加重一點。',description:'兩個星號包住粗體，一個星號包住斜體。刪除線使用常見擴充語法 ~~。',source:'讓 **重要的文字** 被看見。\n\n也能 *輕輕強調*，或 ~~劃掉舊想法~~。',tip:'符號要成對出現，並緊貼文字。'},
  {symbol:'≡',name:'清單',title:'把零散想法，排成隊。',description:'使用 - 加空格建立無序清單，或用數字加句點建立有序清單。',source:'- 收集靈感\n- 整理筆記\n- 開始創作\n\n1. 寫下第一步\n2. 接著往前走',tip:'每個清單項目各佔一行。'},
  {symbol:'↗',name:'連結與圖片',title:'讓文字，連上更大的世界。',description:'方括號寫顯示文字，圓括號放網址。前面加上驚嘆號就變成圖片，方括號文字作為替代描述。',source:'[前往 Markdown 說明](https://commonmark.org/help/)\n\n![紫色靈感圖示](./spark.svg)',tip:'圖片描述可以幫助使用螢幕閱讀器的讀者理解內容。'},
  {symbol:'❞',name:'引用',title:'好句子，值得留一個位置。',description:'在行首加上 > 和空格，建立一段引用。適合摘錄、引言或補充說明。',source:'> 把複雜留給工具，\n> 把專注留給想法。',tip:'連續的引用行會合併成同一個引用區塊。'},
  {symbol:'</>',name:'程式碼',title:'讓程式碼，保有自己的樣子。',description:'反引號包住行內程式碼；三個反引號包住多行程式碼區塊。',source:'試試 `console.log()`。\n\n```javascript\nconst idea = "Hello, Markdown!";\nconsole.log(idea);\n```',tip:'程式碼區塊中的符號會原樣顯示。'},
  {symbol:'▦',name:'表格',title:'把資訊，對齊你的思路。',description:'使用 | 分隔欄位，再用 --- 分隔標題列和內容列。這是常見擴充語法。',source:'| 語法 | 用途 |\n| --- | --- |\n| # | 標題 |\n| ** | 粗體 |',tip:'表格最少需要標題列與分隔列。'},
  {symbol:'☑',name:'待辦清單',title:'寫下來，再一項項完成。',description:'在清單符號後放上 [ ]，就是未完成項目；[x] 代表完成。這是常見擴充語法。',source:'- [x] 認識 Markdown\n- [ ] 練習常見語法\n- [ ] 寫出我的第一篇筆記',tip:'方括號裡的空格代表未勾選。'},
  {symbol:'—',name:'分隔線',title:'留一條線，換一個段落。',description:'在獨立的一行放上三個連字號，建立水平分隔線。前後留空行更清楚。',source:'第一個想法，在這裡告一段落。\n\n---\n\n接下來，開始新的篇章。',tip:'段落之間留一個空行，閱讀更舒服。'}
];
const escapeHTML = value => value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
function safeURL(value, image = false) {
  try { const url = new URL(value, location.href); return (['https:','http:'].includes(url.protocol) || (image && url.protocol === 'file:' && value === './spark.svg')) ? escapeHTML(url.href) : ''; } catch { return ''; }
}
function inline(value) {
  const tokens = [];
  const token = html => { tokens.push(html); return `\u0000${tokens.length-1}\u0000`; };
  let result = value.replace(/\u0000/g,'').replace(/`([^`]+)`/g, (_,code) => token('<code>'+escapeHTML(code)+'</code>'));
  result = result.replace(/!\[([^\]]*)\]\(([^\s)]+)\)/g, (_,alt,url) => { const safe = safeURL(url,true); return token(safe ? `<img src="${safe}" alt="${escapeHTML(alt)}" loading="lazy">` : escapeHTML(alt)); });
  result = result.replace(/\[([^\]]+)\]\(([^\s)]+)\)/g, (_,label,url) => { const safe = safeURL(url); return token(safe ? `<a href="${safe}" target="_blank" rel="noopener noreferrer">${escapeHTML(label)}</a>` : escapeHTML(label)); });
  return escapeHTML(result).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\*([^*]+)\*/g,'<em>$1</em>').replace(/~~([^~]+)~~/g,'<del>$1</del>').replace(/\u0000(\d+)\u0000/g,(_,index)=>tokens[Number(index)]);
}
function renderMarkdown(source) {
  const lines = source.replace(/\r\n/g,'\n').split('\n');
  const output = [];
  let index = 0;
  const isBlock = line => /^(#{1,6}\s|```|>\s?|[-*+]\s|\d+\.\s|\s*([-*_])(?:\s*\2){2,}\s*$)/.test(line);
  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) { index++; continue; }
    if (/^```/.test(line)) { const code = []; index++; while(index < lines.length && !/^```/.test(lines[index])) code.push(lines[index++]); index++; output.push('<pre><code>'+escapeHTML(code.join('\n'))+'</code></pre>'); continue; }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) { output.push(`<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`); index++; continue; }
    if (/^\s*([-*_])(?:\s*\1){2,}\s*$/.test(line)) { output.push('<hr>'); index++; continue; }
    if (line.includes('|') && index+1 < lines.length && /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[index+1])) {
      const cells = row => row.trim().replace(/^\||\|$/g,'').split('|').map(cell => cell.trim());
      output.push('<table><thead><tr>'+cells(line).map(cell=>'<th>'+inline(cell)+'</th>').join('')+'</tr></thead><tbody>'); index+=2;
      while(index < lines.length && lines[index].includes('|') && lines[index].trim()) output.push('<tr>'+cells(lines[index++]).map(cell=>'<td>'+inline(cell)+'</td>').join('')+'</tr>');
      output.push('</tbody></table>'); continue;
    }
    if (/^>/.test(line)) { const quotes=[]; while(index < lines.length && /^>/.test(lines[index])) quotes.push(lines[index++].replace(/^>\s?/,'')); output.push('<blockquote>'+quotes.map(inline).join('<br>')+'</blockquote>'); continue; }
    const list = line.match(/^([-*+]|\d+\.)\s+(.*)$/);
    if (list) { const ordered = /\d/.test(list[1]); const tag = ordered?'ol':'ul'; const start = ordered?` start="${parseInt(list[1],10)}"`:''; output.push(`<${tag}${start}>`); while(index < lines.length) { const item = lines[index].match(ordered?/^\d+\.\s+(.*)$/:/^[-*+]\s+(.*)$/); if (!item) break; const task=item[1].match(/^\[([ xX])\]\s+(.*)$/); output.push('<li>'+(task?`<input type="checkbox" disabled ${task[1].toLowerCase()==='x'?'checked':''} aria-label="${escapeHTML(task[2])}"> `+inline(task[2]):inline(item[1]))+'</li>'); index++; } output.push(`</${tag}>`); continue; }
    const paragraph = [line]; index++;
    while(index < lines.length && lines[index].trim() && !isBlock(lines[index]) && !(lines[index].includes('|') && lines[index+1]?.includes('---'))) paragraph.push(lines[index++]);
    output.push('<p>'+paragraph.map(inline).join('\n')+'</p>');
  }
  return output.join('\n');
}
const editor = document.querySelector('#editor');
const defaultText = '# 今天，開始用 Markdown。\n\n把 **靈感** 寫下來，讓想法慢慢成形。\n\n## 我的創作清單\n- 收集一點靈感\n- 寫下第一個想法\n- 試試不同的語法\n\n> 不必完美，先開始就好。\n\n用 `Markdown`，專注在真正想說的事。';
let selected = 0;
function selectLesson(index) { selected=index; const lesson=lessons[index]; document.querySelectorAll('#lesson-tabs button').forEach((button,position)=>{button.classList.toggle('active',position===index);button.setAttribute('aria-pressed',String(position===index));}); document.querySelector('#lesson-number').textContent=String(index+1).padStart(2,'0')+' / 09'; document.querySelector('#lesson-title').textContent=lesson.title;document.querySelector('#lesson-description').textContent=lesson.description;document.querySelector('#lesson-source').textContent=lesson.source;document.querySelector('#lesson-preview').innerHTML=renderMarkdown(lesson.source);document.querySelector('#lesson-tip').textContent='↳ '+lesson.tip; }
lessons.forEach((lesson,index)=>{const button=document.createElement('button');button.innerHTML=`<span class="symbol">${escapeHTML(lesson.symbol)}</span>${lesson.name}`;button.addEventListener('click',()=>selectLesson(index));document.querySelector('#lesson-tabs').append(button);});
function update() {document.querySelector('#preview').innerHTML=renderMarkdown(editor.value);document.querySelector('#count').textContent=editor.value.length+' 字元';try{localStorage.setItem('markdown-lab-content',editor.value);}catch{document.querySelector('.editor-foot span:last-child').textContent='此瀏覽器無法儲存，請下載保留內容';}}
let toastTimer;
function toast(message){const element=document.querySelector('#toast');element.textContent=message;element.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>element.classList.remove('visible'),2200);}
try{editor.value=localStorage.getItem('markdown-lab-content')??defaultText;}catch{editor.value=defaultText;}
editor.addEventListener('input',update);
editor.addEventListener('keydown',event=>{if(event.key==='Tab'){event.preventDefault();const start=editor.selectionStart;editor.setRangeText('  ',start,editor.selectionEnd,'end');update();}});
document.querySelector('#try-example').addEventListener('click',()=>{editor.value=lessons[selected].source;update();document.querySelector('#playground').scrollIntoView({behavior:'smooth'});editor.focus({preventScroll:true});toast('範例已載入，換你試試！');});
document.querySelector('#reset').addEventListener('click',()=>{editor.value=defaultText;update();toast('已重設為初始範例');});
document.querySelector('#copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(editor.value);toast('語法已複製！');}catch{editor.focus();editor.select();toast('請按 Ctrl+C 複製選取的語法');}});
document.querySelector('#download').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([editor.value],{type:'text/markdown;charset=utf-8'}));const anchor=document.createElement('a');anchor.href=url;anchor.download='我的-Markdown-筆記.md';anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('已下載 Markdown 筆記');});
const challenges=[{prompt:'在編輯器寫一個一級標題，內容是「我的第一篇筆記」。',check:text=>/^# 我的第一篇筆記\s*$/m.test(text),hint:'提示：在新的一行輸入 #、一個空格，再寫上指定標題。'},{prompt:'把「靈感」兩個字設成粗體。',check:text=>/\*\*靈感\*\*/.test(text),hint:'提示：把靈感放在兩組 ** 中間。'},{prompt:'建立一個至少包含兩個項目的無序清單。',check:text=>/^[-*+]\s+\S.*\n[-*+]\s+\S/m.test(text),hint:'提示：連續兩行都用 - 加一個空格開頭。'},{prompt:'加入一段引用，內容是「先開始就好」。',check:text=>/^>\s+先開始就好\s*$/m.test(text),hint:'提示：在新的一行用 > 和一個空格開頭。'}];
let challengeIndex=0;
function showChallenge(){document.querySelector('#challenge-prompt').textContent=challenges[challengeIndex].prompt;document.querySelector('#feedback').textContent='在上方文字實驗室完成，再來檢查！';}
document.querySelector('#check').addEventListener('click',()=>{const codeFree=editor.value.replace(/^```[^\n]*\n[\s\S]*?(?:^```.*$|$(?![\s\S]))/gm,'');const challenge=challenges[challengeIndex];document.querySelector('#feedback').textContent=challenge.check(codeFree)?'✓ 做到了！你已經掌握這個語法，換一道繼續試試。':challenge.hint;});
document.querySelector('#next').addEventListener('click',()=>{challengeIndex=(challengeIndex+1)%challenges.length;showChallenge();});
selectLesson(0);showChallenge();update();
