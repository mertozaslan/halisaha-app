// Google Apps Script - Sheets'e yazmak için
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({status: 'Web App is running', method: 'GET'}))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById('1upqhrZcw8BppgkytzUuzYjgNDJ-Y_B1K');
    
    let result;
    switch(data.action) {
      case 'getData':
        result = getData(ss, data.range);
        break;
      case 'addPlayer':
        result = addPlayer(ss, data.player);
        break;
      case 'addEvaluation':
        result = addEvaluation(ss, data.evaluation);
        break;
      case 'updatePlayer':
        result = updatePlayer(ss, data.player);
        break;
      case 'addWeeklyPlayer':
        result = addWeeklyPlayer(ss, data.weeklyPlayer);
        break;
      default:
        throw new Error('Unknown action: ' + data.action);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({success: true, data: result}))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
    
  } catch (error) {
    console.error('Error in doPost:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false, 
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
  }
}

function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '3600'
    });
}

function getData(ss, range) {
  try {
    const sheetName = range.split('!')[0];
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      throw new Error(`Sheet ${sheetName} not found`);
    }
    
    const data = sheet.getDataRange().getValues();
    return data;
      
  } catch (error) {
    console.error('Error in getData:', error);
    throw error;
  }
}

function addPlayer(ss, player) {
  try {
    const sheet = ss.getSheetByName('Oyuncular');
    if (!sheet) {
      throw new Error('Oyuncular sheet not found');
    }
    
    sheet.appendRow([
      player.name,
      player.position,
      player.totalRating || 0,
      player.evaluationCount || 0,
      player.averageRating || 0,
      player.lastEvaluationDate || '',
      player.isActive !== false
    ]);
    
    return {action: 'addPlayer', success: true};
      
  } catch (error) {
    console.error('Error in addPlayer:', error);
    throw error;
  }
}

function addEvaluation(ss, evaluation) {
  try {
    const sheet = ss.getSheetByName('Degerlendirmeler');
    if (!sheet) {
      throw new Error('Degerlendirmeler sheet not found');
    }
    
    sheet.appendRow([
      evaluation.playerId,
      evaluation.playerName,
      evaluation.passing,
      evaluation.defense,
      evaluation.attack,
      evaluation.stamina,
      evaluation.teamwork,
      evaluation.comment || '',
      evaluation.date
    ]);
    
    return {action: 'addEvaluation', success: true};
      
  } catch (error) {
    console.error('Error in addEvaluation:', error);
    throw error;
  }
}

function updatePlayer(ss, player) {
  try {
    const sheet = ss.getSheetByName('Oyuncular');
    if (!sheet) {
      throw new Error('Oyuncular sheet not found');
    }
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === player.name) {
        sheet.getRange(i + 1, 3, 1, 4).setValues([[
          player.totalRating,
          player.evaluationCount,
          player.averageRating,
          player.lastEvaluationDate
        ]]);
        break;
      }
    }
    
    return {action: 'updatePlayer', success: true};
      
  } catch (error) {
    console.error('Error in updatePlayer:', error);
    throw error;
  }
}

function addWeeklyPlayer(ss, weeklyPlayer) {
  try {
    const sheet = ss.getSheetByName('HaftaninOyuncusu');
    if (!sheet) {
      throw new Error('HaftaninOyuncusu sheet not found');
    }
    
    sheet.appendRow([
      weeklyPlayer.playerId,
      weeklyPlayer.playerName,
      weeklyPlayer.week,
      weeklyPlayer.date,
      weeklyPlayer.averageRating || 0
    ]);
    
    return {action: 'addWeeklyPlayer', success: true};
      
  } catch (error) {
    console.error('Error in addWeeklyPlayer:', error);
    throw error;
  }
} 