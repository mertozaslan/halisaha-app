// Google Apps Script - Sheets'e yazmak için
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById('1upqhrZcw8BppgkytzUuzYjgNDJ-Y_B1K');
    
    switch(data.action) {
      case 'getData':
        return getData(ss, data.range);
      case 'addPlayer':
        return addPlayer(ss, data.player);
      case 'addEvaluation':
        return addEvaluation(ss, data.evaluation);
      case 'updatePlayer':
        return updatePlayer(ss, data.player);
      case 'addWeeklyPlayer':
        return addWeeklyPlayer(ss, data.weeklyPlayer);
      default:
        throw new Error('Unknown action: ' + data.action);
    }
    
  } catch (error) {
    console.error('Error in doPost:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false, 
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getData(ss, range) {
  try {
    const sheetName = range.split('!')[0];
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      throw new Error(`Sheet ${sheetName} not found`);
    }
    
    const data = sheet.getDataRange().getValues();
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true, 
        values: data
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error in getData:', error);
    throw error;
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