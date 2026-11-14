// optionのデータを配列として保持する
let items = [];

$("#generate").on("click", function () {
  $(this).prop("disabled", true).text("生成中。。。");

  // ボタンが変更されるまで待つ
  setTimeout(() => {
    const selectCount = Math.max(1, parseInt($("#select-count").val()) || 1);
    const optionCount = Math.max(1, parseInt($("#option-count").val()) || 1);
    const mode = $("input[name=mode]:checked").val();
    const $resultForm = $("#result-form");
    const generatedSelect2ClassName = "generated-select2";

    items = Array.from({ length: optionCount }, (_, i) => {
      return { id: i + 1, text: `選択肢${i + 1}` };
    });

    $resultForm.empty(); // イベントも一緒に消す

    const startTime = performance.now(); // 計測開始
    const $allSelect = Array.from({ length: selectCount }, () => {
      return $("<select>", { class: generatedSelect2ClassName });
    });

    if (mode === "normal") {
      // 全てのoptionを生成
      $allSelect.forEach(($select, i) => {
        for (let j = 0; j < optionCount; j++) {
          const item = items[j];
          const option = $("<option>", {
            value: item.id,
            text: item.text,
            selected: i === j,
          });
          $select.append(option);
        }
      });
    } else {
      // 表示するoptionのみ生成
      $allSelect.forEach(($select, i) => {
        const item = items[i];
        const option = $("<option>", {
          value: item.id,
          text: item.text,
          selected: true,
        });
        $select.append(option);
      });
    }
    $resultForm.append($allSelect);
    const htmlGeneratedTime = performance.now(); // HTML生成までの時間

    // Select2初期化
    if (mode === "normal") {
      $(`.${generatedSelect2ClassName}`).select2();
    } else {
      $(`.${generatedSelect2ClassName}`).select2({
        ajax: {
          transport: function (params, success) {
            const term = (params.data?.term || "").toLowerCase();
            const filtered = term
              ? items.filter((i) => i.text.toLowerCase().includes(term))
              : items;
            const page = params.data.page || 1;
            const perPage = 100;
            success({
              results: filtered.slice((page - 1) * perPage, page * perPage),
              pagination: {
                more: page * perPage < filtered.length,
              },
            });
            return {
              abort() {}, // 手元のデータを絞り込むだけなので空の関数
            };
          },
        },
      });
    }
    const endTime = performance.now(); // Select2初期化までの時間

    // パフォーマンスを出力
    $("#html-generate-time").text(`${htmlGeneratedTime - startTime} ms`);
    $("#select2-initialize-time").text(`${endTime - htmlGeneratedTime} ms`);
    $("#elapsed-time").text(`${endTime - startTime} ms`);

    $(this).text("生成する");
    $(this).prop("disabled", false);
  });
});

// 生成モード選択時のテキストの入れ替えと初期化
const MODE_DESC_NORMAL =
  "通常：全選択肢をoptionで生成した後、ページ内のSelect2をまとめて初期化します。（遅い）";
const MODE_DESC_OPTIMIZED =
  "最適化：選択肢はJavaScript上で1つだけ保持し、ajax.transportで検索します。ページネーションで選択肢を100件ごとに表示します。（速い）";

const $modeDesc = $("#mode-desc");

function updateModeDesc() {
  const mode = $("input[name=mode]:checked").val();
  if (mode === "normal") {
    $modeDesc.text(MODE_DESC_NORMAL);
  } else {
    $modeDesc.text(MODE_DESC_OPTIMIZED);
  }
}

updateModeDesc();
$("input[name=mode]").on("change", updateModeDesc);
