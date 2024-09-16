XlsxPopulate.fromFileAsync("./excel/" + date + ".xlsx")
    .then(workbook => {    
      const sheet = workbook.sheet(0);
      i = sheet.cell('Y1').value()
      sheet.cell('A' + (i + 2)).value(i + 1);
      
      for (let f = 0; f < DataSet.length; f++) {
        const cell = sheet.cell('C' + (i + 2));
        const currentValue = cell.value();
        const newValue = DataSet[f].Price[0].NAME + " " + DataSet[f].Price[0].MODEL + " " + DataSet[f].Price[0].COLOR +'\n';

        if (currentValue !== null && currentValue !== undefined) {
          cell.value(currentValue + newValue);
        } else {
          cell.value(newValue);
        }
      }
      for (let f = 0; f < DataSet.length; f++) {
        const cell = sheet.cell('D' + (i + 2));
        const currentValue = cell.value();
        const newValue = DataSet[f].Price[0].quatity +'\n';
        if (currentValue !== null && currentValue !== undefined) {
          cell.value(currentValue + newValue);
        } else {
          cell.value(newValue);
        }
      }
      for (let f = 0; f < DataSet.length; f++) {
        const cell = sheet.cell('E' + (i + 2));
        const cell1 = sheet.cell('G' + (i + 2));
        const cell2 = sheet.cell('J' + (i + 2));
        const currentValue = cell.value();
        const currentValue1 = cell1.value();
        const currentValue2 = cell2.value();
        const newValue = DataSet[f].Price[0].CENA +'\n';
        if (currentValue !== null && currentValue !== undefined) {
          cell.value(currentValue + newValue);
          cell1.value(currentValue1 + newValue);
          cell2.value(currentValue2 + newValue);
        } else {
          cell.value(newValue);
          cell1.value(newValue);
          cell2.value(newValue);
        }
      }
      for (let f = 0; f < DataSet.length; f++) {
        const cell = sheet.cell('F' + (i + 2));
        const cell1 = sheet.cell('K' + (i + 2));
        const currentValue = cell.value();
        const currentValue1 = cell1.value();
        const newValue = (DataSet[f].Price[0].CENA - DataSet[f].Price[0].CENA*0.10) +'\n';
        const newValue1 = (DataSet[f].Price[0].CENA*0.10) +'\n';
        if (currentValue !== null && currentValue !== undefined) {
          cell.value(currentValue + newValue);
          cell1.value(currentValue1 + newValue1);
        } else {
          cell.value(newValue);
          cell1.value(newValue1);
        }
      }
      for (let f = 0; f < DataSet.length; f++) {
        
      }
      for (let f = 0; f < DataSet.length; f++) {
        const cell = sheet.cell('H' + (i + 2));
        const currentValue = cell.value();
        if(DISCOUNT > 0) {
          newValue = DISCOUNT + "\n";
        } else{
          newValue = DataSet[f].Price[0].DISCOUNT +'\n';
        }
        if (currentValue !== null && currentValue !== undefined) {
          cell.value(currentValue + newValue);
        } else {
          cell.value(newValue);
        }
      }
      for (let f = 0; f < DataSet.length; f++) {
        const cell = sheet.cell('I' + (i + 2));
        const currentValue = cell.value();
        if(DISCOUNT > 0){
          newValue = DataSet[f].Price[0].CENA - (DataSet[f].Price[0].CENA * DISCOUNT)/100 +'\n';
        }
        else{
          newValue = DataSet[f].Price[0].CENA - (DataSet[f].Price[0].CENA * DataSet[f].Price[0].DISCOUNT)/100 +'\n';
        }
        if (currentValue !== null && currentValue !== undefined) {
          cell.value(currentValue + newValue);
        } else {
          cell.value(newValue);
        }
        const cell2 = sheet.cell('M' + (i + 2));
        cell2.value('0');
        for (let f = 0; f < DataSet.length; f++) {
          const cell = sheet.cell('M' + (i + 2));
          const currentValue = cell.value();
          console.log(currentValue)
          const newValue = DataSet[f].Price[0].quatity;
          if (currentValue !== null && currentValue !== undefined) {
            cell.value(Number(currentValue) + Number(newValue));
            console.log(Number(currentValue),Number(newValue))
          } else {
            cell.value(Number(newValue));
          }
        }

          const cell1 = sheet.cell('N' + (i + 2));
          cell1.value(Number(TOTAL))

          sheet.cell('P1').formula('SUM(N2:N' + (i + 2) + ')');

        sheet.cell('Y1').value(i+1);
      }
      return workbook.toFileAsync("./excel/" + date + ".xlsx");
    })
    .then(() => {
    })
    .catch(error => {
      console.error('Произошла ошибка:', error);
    });