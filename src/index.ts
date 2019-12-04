function test() {
    const ss = SpreadsheetApp.openById("");
    const sheet = ss.getSheetByName("records");
    const values = sheet.getRange(2, 1, 1, 5).getValues();
    const ifttt_date: string = values[0][0];
    const category1: string = values[0][1];
    const category2: string = values[0][2];
    const hours: number = values[0][3];
    const target_sheet_name1: string = category1;
    const target_sheet_name2: string = category1 + '_' + category2;
    const target_sheet1 = ss.getSheetByName(target_sheet_name1);
    const target_sheet2 = ss.getSheetByName(target_sheet_name2);
    const log_date: Date = formatIftttDatetime(ifttt_date);
    Logger.log(1);
    Logger.log(log_date);

    const date_values = transpose(target_sheet2.getRange(2, 1, target_sheet2.getLastRow() - 1, 1).getValues())[0].map(plus4Hours);
    Logger.log(2);
    Logger.log(transpose(target_sheet2.getRange(2, 1, target_sheet2.getLastRow() - 1, 1).getValues())[0]);
    var target_row_column = [1, 1];
    for (var idx=0;idx<date_values.length-1;idx++) {
        if (date_values[idx] <= log_date && log_date < date_values[idx+1]) {
            for (var n_days=0;n_days<6;n_days++) {
                if (plusDays(date_values[idx], n_days) <= log_date && log_date < plusDays(date_values[idx], n_days+1)) {
                    target_row_column =  [idx+2, n_days+2];
                    break
                }
            }
        }
    }
    target_sheet2.getRange(target_row_column[0], target_row_column[1]).setBackground('#b6d7a8');

}
function todayUpdate() {
    const ss = SpreadsheetApp.openById("");
    const log_sheet = ss.getSheetByName("records");
    const log_iffft_datetime_values: string[] = transpose(log_sheet.getRange(2, 1, log_sheet.getLastRow() - 1, 1).getValues())[0];
    const now = new Date();
    const today_start_datetime = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 4, 0, 0);
    for (var idx=0;idx<log_iffft_datetime_values.length;idx++) {
        const log_ifttt_datetime: string = log_iffft_datetime_values[idx];
        const log_datetime: Date = formatIftttDatetime(log_ifttt_datetime);
        if (today_start_datetime < log_datetime) {
            break;
        }
    }

    // 今日のログがない場合
    if (idx === log_iffft_datetime_values.length) {
        return;
    }

    const start_row = idx+2;
    const today_log_values = log_sheet.getRange(start_row, 1, log_sheet.getLastRow() - 1, 5).getValues();

    
    const template_sheet = ss.getSheetByName('template');
    const date_values = transpose(template_sheet.getRange(2, 1, template_sheet.getLastRow() - 1, 1).getValues())[0];

    var target_row_column = [1, 1];
    for (var idx=0;idx<date_values.length-1;idx++) {
        if (date_values[idx] <= today_start_datetime && today_start_datetime < date_values[idx+1]) {
            for (var n_days=0;n_days<6;n_days++) {
                if (plusDays(date_values[idx], n_days) <= today_start_datetime && today_start_datetime < plusDays(date_values[idx], n_days+1)) {
                    target_row_column =  [idx+2, n_days+2];
                    break
                }
            }
        }
    }

    var category1_cal_dict: {[index: string]: {[index: string]: number}} = {};
    var category1_2_cal_dict: {[index: string]: {[index: string]: number}} = {};
    for (var i=0;i<today_log_values.length;i++) {
        const today_log_row = today_log_values[i];
        const log_category1: string = today_log_row[1];
        const log_category2: string = today_log_row[2];
        const log_category1_2 = log_category1 + '_' + log_category2;
        const log_hours: number = Number(today_log_row[3]);
        if (!log_category1) {
            continue;
        }

        if (!Boolean(Object.keys(category1_cal_dict).indexOf(log_category1)+1)) {
            category1_cal_dict[log_category1] = {'hours':0.0, 'times':0};
        }
        if (!Boolean(Object.keys(category1_2_cal_dict).indexOf(log_category1_2)+1)) {
            category1_2_cal_dict[log_category1_2] = {'hours':0.0, 'times':0};
        }

        category1_cal_dict[log_category1]['hours'] += log_hours;
        category1_cal_dict[log_category1]['times'] += 1;

        category1_2_cal_dict[log_category1_2]['hours'] += log_hours;
        category1_2_cal_dict[log_category1_2]['times'] += 1;

    }

    const category1_sheet = ss.getSheetByName("category1");
    const category1_2_sheet = ss.getSheetByName("category1_2");
    const category1_values = category1_sheet.getRange(1, 1, category1_sheet.getLastRow(), 7).getValues();
    const category1_2_values = category1_2_sheet.getRange(1, 1, category1_2_sheet.getLastRow(), 8).getValues();

    const line2color = ["#d9ead3", "#b6d7a8", "#93c47d", "#6aa84f", "#38761d", "#274e13"];
    for (const category1 in category1_cal_dict) {
        var check_type: string;
        var lines: number[];
        for (var i=0;i<category1_values.length;i++) {
            const category1_row = category1_values[i];
            if (category1_row[0] === category1) {
                check_type = category1_row[1];
                lines = category1_row.slice(2, 7).map(Number);
                break;
            }
        }
        const value_added: number = category1_cal_dict[category1][check_type];
        const target_sheet1 = ss.getSheetByName(category1);

        for (var i=0;i<lines.length;i++) {
            if (value_added < lines[i]) {
                target_sheet1.getRange(target_row_column[0], target_row_column[1]).setBackground(line2color[i]);
                break
            } else if (i == lines.length - 1) {
                target_sheet1.getRange(target_row_column[0], target_row_column[1]).setBackground(line2color[lines.length]);
            }
        }
    }
    for (const category1_2 in category1_2_cal_dict) {
        var check_type: string;
        var lines: number[];
        for (var i=0;i<category1_2_values.length;i++) {
            const category1_2_row = category1_2_values[i];
            if (category1_2_row[0] + '_' + category1_2_row[1] === category1_2) {
                check_type = category1_2_row[2];
                lines = category1_2_row.slice(3, 8).map(Number);
                break;
            }
        }
        const value_added: number = category1_2_cal_dict[category1_2][check_type];
        const target_sheet1_2 = ss.getSheetByName(category1_2);

        for (var i=0;i<lines.length;i++) {
            if (value_added < lines[i]) {
                target_sheet1_2.getRange(target_row_column[0], target_row_column[1]).setBackground(line2color[i]);
                break
            } else if (i == lines.length - 1) {
                target_sheet1_2.getRange(target_row_column[0], target_row_column[1]).setBackground(line2color[lines.length]);
            }
        }
    }
}

function toDate(s_date: string): Date {
    return new Date(s_date);
}

function plusDays(date: Date, n_days: number): Date{
    const year = date.getFullYear();
    const monthIndex = date.getMonth();
    const day = date.getDate() + n_days;
    const hour = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    
    return new Date(year, monthIndex, day, hour, minutes, seconds);
}

function plus4Hours(date: Date): Date {
    const year = date.getFullYear();
    const monthIndex = date.getMonth();
    const day = date.getDate();
    const hour = date.getHours() + 4;
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    return new Date(year, monthIndex, day, hour, minutes, seconds);
}

const transpose = a => a[0].map((_, c) => a.map(r => r[c]));

function formatIftttDatetime(ifttt_date: string): Date {
    var dates: string[] = ifttt_date.split(' ');
    const ifttt_time: string = dates.slice(-1)[0];
    const am_pm: string = ifttt_time.slice(-2);
    var times: number[] = ifttt_time.slice(0, -2).split(':').map(x => parseInt(x));
    if (times[0] === 12) {
        times[0] -= 12;
    }
    if (am_pm === 'PM') {
        times[0] += 12;
    }
    const s_time: string = times[0].toString() + ':' + times[1].toString();
    const s_date: string = dates[0] + ' ' + dates[1] + ' ' + dates[2] + ' ' + s_time;
    const date = new Date(s_date);

    return date;
}

