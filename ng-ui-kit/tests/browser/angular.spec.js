import{test}from'@playwright/test';import{checkAngular,assertConsumers}from'../../tools/check-angular.mjs';
test('installed Angular consumers preserve base, charts and legacy contracts',async({page})=>{
 test.setTimeout(600000);const consumers=await checkAngular();try{await assertConsumers(page,consumers);}finally{await page.goto('about:blank');await consumers.close();}
});
