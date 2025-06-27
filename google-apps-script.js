// Google Apps Script - Sheets'e yazmak için
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById('YOUR_SHEET_ID');
    
    switch(data.action) {
      case 'addPlayer':
        addPlayer(ss, data.player);
        break;
      case 'addEvaluation':
        addEvaluation(ss, data.evaluation);
        break;
      case 'updatePlayer':
        updatePlayer(ss, data.player);
        break;
      case 'addWeeklyPlayer':
        addWeeklyPlayer(ss, data.weeklyPlayer);
        break;
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function addPlayer(ss, player) {
  const sheet = ss.getSheetByName('Oyuncular');
  sheet.appendRow([
    player.name,
    player.position,
    player.totalRating,
    player.evaluationCount,
    player.averageRating,
    player.lastEvaluationDate,
    player.isActive
  ]);
}

function addEvaluation(ss, evaluation) {
  const sheet = ss.getSheetByName('Degerlendirmeler');
  sheet.appendRow([
    evaluation.playerId,
    evaluation.playerName,
    evaluation.passing,
    evaluation.defense,
    evaluation.attack,
    evaluation.stamina,
    evaluation.teamwork,
    evaluation.comment,
    evaluation.date
  ]);
}

function updatePlayer(ss, player) {
  const sheet = ss.getSheetByName('Oyuncular');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === player.name) { // İsim bazında bul
      sheet.getRange(i + 1, 3, 1, 4).setValues([[
        player.totalRating,
        player.evaluationCount,
        player.averageRating,
        player.lastEvaluationDate
      ]]);
      break;
    }
  }
}

function addWeeklyPlayer(ss, weeklyPlayer) {
  const sheet = ss.getSheetByName('HaftaninOyuncusu');
  sheet.appendRow([
    weeklyPlayer.playerId,
    weeklyPlayer.playerName,
    weeklyPlayer.week,
    weeklyPlayer.date,
    weeklyPlayer.averageRating || 0
  ]);
} 