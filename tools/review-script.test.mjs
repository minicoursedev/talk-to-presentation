import {test} from 'node:test';
import assert from 'node:assert/strict';
import {renderReview} from './review-script.mjs';
test('review preserves spoken text, page order and missing fields; escapes content',()=>{
 const slides=[{page:8,screen:'unused',parts:[{text:'Speaker'},{text:'<script>bad()</script>'}],narration:'第一行\n第二行',tone:'平靜',backgroundNarration:'補充'}, {page:3,screen:'end',narration:null}];
 const before=JSON.stringify(slides);const html=renderReview({title:'<topic>'},slides,'hash','time');
 assert.ok(html.indexOf('id="page-8"')<html.indexOf('id="page-3"'));
 assert.ok(html.includes('第一行\n第二行'));assert.ok(html.includes('Speaker\n&lt;script&gt;'));
 assert.ok(!html.includes('<script>bad()'));assert.ok(!html.includes('unused'));
 assert.ok(html.includes('1 頁尚未填寫主台詞'));assert.equal(JSON.stringify(slides),before);
 assert.throws(()=>renderReview({},[{page:1},{page:1}],'',''));
});
test('review shows rich text and segmented narration with their own tones',()=>{
 const slides=[{page:1,parts:[{runs:[{text:'先理解',color:'white'},{text:'<問題>',color:'highlight'}]}],narration:'先理解。再解決。',narrationSegments:[{text:'先理解。',tone:'平靜敘述'},{text:'再解決。',tone:'堅定'}]}];
 const html=renderReview({},slides,'','');
 assert.ok(html.includes('先理解&lt;問題&gt;'));
 assert.ok(html.includes('<span>先理解。</span><strong>平靜敘述</strong>'));
 assert.ok(html.includes('<span>再解決。</span><strong>堅定</strong>'));
 assert.throws(()=>renderReview({},[{...slides[0],narration:'已修改。'}],'',''),/segments/);
 assert.throws(()=>renderReview({},[{...slides[0],narrationSegments:[]}],'',''),/segments/);
});
