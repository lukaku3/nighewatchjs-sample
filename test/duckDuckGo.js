const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');
const pdf = require('pdf-parse');

describe('duckduckgo example', function () {
  const downloadDir = path.resolve(__dirname, 'downloads');
  const downloadPath = path.join(downloadDir, '1_unlocked.pdf');

  it('Search Nightwatch.js and check results', function (browser) {
    browser
      .navigateTo('https://duckduckgo.com')
      .waitForElementVisible('input[name=q]')
      .sendKeys('input[name=q]', ['Nightwatch.js'])
      .click('*[type="submit"]')
      .assert.visible('#react-layout')
      .pause(5000)  // PDFのダウンロードを待つ
      .perform(done => {
        const dataBuffer = fs.readFileSync(downloadPath);

        pdf(dataBuffer).then(function (data) {
          const text = data.text;
          // console.log('PDF Content:', text);

          // 指定の文字列が含まれているか確認
          const searchString = '1MBO';
          if (text.includes(searchString)) {
            console.log('指定の文字列がPDFに含まれています。');
            // PDFをブラウザに表示
            browser
              .url(`file://${downloadPath}`)
              .waitForElementVisible('body', 1000)
              .pause(2000)  // PDFのレンダリングを待つ
              .execute(`window.find('${searchString}');`)
              .pause(2000)  // テキストのハイライトを待つ
              .saveScreenshot(path.join(downloadDir, 'screenshot.png'), function (result) {
                console.log('スクリーンショットを保存しました:');
              });
          } else {
            console.error('指定の文字列がPDFに含まれていません。');
          }

          done();
        }).catch(err => {
          console.error('PDFの解析中にエラーが発生しました:', err);
          done();
        });

      })
    // .assert.textContains('#react-layout', 'Nightwatch.js');
  });
});
