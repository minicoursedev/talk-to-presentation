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
