
console.log("人生クエスト手帳：JavaScript読み込み成功");

// ========================================
// 人生クエスト手帳 - script.js 完成版
// ========================================

// ① データ管理
let questList = [];
let playerExp = 0;

const expPerLevel = 100;


// ========================================
// ② LocalStorageからデータを復元
// ========================================

const savedQuests = localStorage.getItem("lifeQuestList");

if (savedQuests !== null) {
    try {
        const parsed = JSON.parse(savedQuests);

        if (Array.isArray(parsed)) {
            questList = parsed
                .filter(q => q && typeof q === "object")
                .map(q => ({
                    name: String(q.name ?? ""),
                    exp: Number.isFinite(Number(q.exp)) &&
                         Number(q.exp) > 0
                        ? Number(q.exp)
                        : 10,
                    completed: q.completed === true
                }));
        }
    } catch (error) {
        console.error("クエストの復元に失敗:", error);
        questList = [];
    }
}

// 経験値を取得
const savedExp = localStorage.getItem("lifeQuestExp");

if (savedExp !== null) {
    const exp = Number(savedExp);

    if (Number.isFinite(exp) && exp >= 0) {
        playerExp = exp;
    } else {
        playerExp = 0;
        localStorage.setItem("lifeQuestExp", "0");
    }
}


// ========================================
// ③ データ保存
// ========================================

function saveData() {
    localStorage.setItem(
        "lifeQuestList",
        JSON.stringify(questList)
    );

    localStorage.setItem(
        "lifeQuestExp",
        String(playerExp)
    );
}


// ========================================
// ④ クエスト一覧を表示
// ========================================

function displayQuests() {

    $("#questList").empty();
    $("#completedList").empty();

    let activeCount = 0;

    for (let i = 0; i < questList.length; i++) {

        const quest = questList[i];

        const li = $("<li>");

        const title = $("<span>")
            .addClass("quest-title")
            .text(quest.name);

        const exp = $("<span>")
            .addClass("quest-exp")
            .text("+" + quest.exp + " XP");

        if (quest.completed === false) {

            activeCount++;

            li.addClass("quest-item");

            const completeBtn = $("<button>")
                .addClass("complete-btn")
                .text("達成！")
                .attr("data-index", i);

            li.append(title);
            li.append(exp);
            li.append(completeBtn);

            $("#questList").append(li);

        } else {

            li.addClass("completed-item");

            li.append("🏆 ");
            li.append(title);
            li.append(" （+" + quest.exp + " XP）");

            $("#completedList").append(li);
        }
    }

    if (activeCount === 0) {
        $("#emptyMessage").show();
    } else {
        $("#emptyMessage").hide();
    }
}


// ========================================
// ⑤ プレイヤーステータス更新
// ========================================

function updateStatus() {

    // NaN対策
    if (!Number.isFinite(playerExp) || playerExp < 0) {
        playerExp = 0;
    }

    const level = Math.floor(playerExp / expPerLevel) + 1;

    const currentExp = playerExp % expPerLevel;

    const nextExp = expPerLevel - currentExp;

    const progress = (currentExp / expPerLevel) * 100;

    $("#playerLevel").text(level);
    $("#playerExp").text(playerExp);
    $("#nextExp").text(nextExp);

    $("#expProgress").css("width", progress + "%");
}


// ========================================
// ⑥ クエスト追加
// ========================================

$("#addQuestBtn").on("click", function() {

    const questText = $("#questText").val().trim();

    if (questText === "") {
        alert("クエスト名を入力してください！");
        return;
    }

    // 難易度欄がない場合は10 XP
    let questExp = Number($("#questDifficulty").val());

    if (!Number.isFinite(questExp) || questExp <= 0) {
        questExp = 10;
    }

    const newQuest = {
        name: questText,
        exp: questExp,
        completed: false
    };

    questList.push(newQuest);

    saveData();
    displayQuests();
    updateStatus();

    $("#questText").val("");
});


// ========================================
// ⑦ クエスト達成
// ========================================

$("#questList").on("click", ".complete-btn", function() {

    const index = Number($(this).attr("data-index"));

    const quest = questList[index];

    if (!quest || quest.completed === true) {
        return;
    }

    // 達成済みに変更
    quest.completed = true;

    // 経験値を加算
    playerExp += quest.exp;

    // データ保存
    saveData();

    // 表示更新
    displayQuests();
    updateStatus();

    alert(
        "クエスト達成！\n" +
        quest.exp + " XP獲得！\n" +
        "現在の経験値：" + playerExp + " XP"
    );
});


// ========================================
// ⑧ 全データリセット
// ========================================

$("#resetBtn").on("click", function() {

    const result = confirm(
        "すべてのクエストと経験値を削除しますか？"
    );

    if (result === false) {
        return;
    }

    localStorage.removeItem("lifeQuestList");
    localStorage.removeItem("lifeQuestExp");

    questList = [];
    playerExp = 0;

    displayQuests();
    updateStatus();

    $("#questText").val("");

    alert("冒険の記録をリセットしました！");
});


// ========================================
// ⑨ ページ読み込み時の初期表示
// ========================================

$(function() {
    displayQuests();
    updateStatus();

    console.log("クエスト一覧:", questList);
    console.log("経験値:", playerExp);
});
