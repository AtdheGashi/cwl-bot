var request = require('request');
var util = require('util');
var fs = require('fs');
var async = require('async');
var csv = require('csvtojson');

var return_csv_url = (id, gid) => {
    return util.format('https://docs.google.com/spreadsheets/d/%s/export?format=csv&id=%s&gid=%s', id, id, gid);
}


var google_sheets = {
    standings: '543930365',
    all_schedule: '0',
    schedule: ['483998443', '1410310631', '2000376204', '1320321067', '93018792', '2011050729', '852800867', '1660857019', '457346659', '558495071', '514573806'],
    leagues: [
        {'name': 'premiere', 'id': '1327Mk6p7wBSBY5bdWHMroPfBAyubyHLHhoPZIidMoNo'},
        {'name': 'rising', 'id': '1bSxAs_L52iDWntQC0HQ-MrbJAVp6-OhYk5ShTGjEDDE'},
        {'name': 'lite', 'id': '1eU7119z8s2z_OIh74HOeUdOmGfNgXzQsUQd-ofn7C2A'},
        {'name': 'invite', 'id': '1uYJZwpBPJvpPpVK-nM1kwWSq7vwnZkXnurYC_ddmOSo'}
    ]
}

function cwl(){}

var pad_right = (str, len) => {
    if(str.length > len){
        return str;
    }else{
        extra_ = len - str.length;
        out = [];
        for(i = 0; i < extra_; i++){
            out.push(" ");
        }
        return str + out.join("");
    }
}

var format_info = (data) => {
    var out = [];
    out.push('```\n');
    out.push(util.format('%s%s', pad_right('Name:', 16), data.name));
    out.push(util.format('%s%s', pad_right('League:', 16), data.league));
    out.push(util.format('%s%s', pad_right('Tag:', 16), data.tag));
    out.push('\nWar info:');
    out.push(util.format('%s%s', pad_right('Total:', 16), (parseInt(data.info.wins) + parseInt(data.info.loss) + parseInt(data.info.tie))));
    out.push(util.format('%s%s', pad_right('Wins:', 16), data.info.wins));
    out.push(util.format('%s%s', pad_right('Loss:', 16), data.info.loss));
    out.push(util.format('%s%s', pad_right('Tie:', 16), data.info.tie));
    out.push(util.format('%s%s', pad_right('Stars for:', 16), data.info.stars_f));
    out.push(util.format('%s%s', pad_right('Stars against:', 16), data.info.stars_a));
    out.push(util.format('%s%s', pad_right('Stars diff:', 16), data.info.stars_diff));
    out.push(util.format('%s%s', pad_right('Average %:', 16), data.info.avg_perc));
    out.push(util.format('%s%s', pad_right('Streak:', 16), data.info.streak));
    out.push('\nStandings:');
    out.push(util.format('%s%s', pad_right('Division:', 16), data.info.st_div));
    out.push(util.format('%s%s', pad_right('Conference:', 16), data.info.st_conf));
    out.push(util.format('%s%s', pad_right('Non:', 16), data.info.st_non));

    out.push('\nResults:');

    for(i in data.info.results){
        res_ = data.info.results[i];
        home_star = res_.result == 'win' ? '*' : ' ';
        enemy_star = res_.result == 'loss' ? '*' : ' ';
        out.push(util.format('%s %s[%s (%s-%s) %s]%s   %s', pad_right(data.tag, 5), home_star, res_.home_perc, res_.home_stars, res_.enemy_stars, res_.enemy_perc, enemy_star, res_.enemy_name));
    }

    out.push('\nSchedule:');
    x = 0;
    for(x in data.info.schedule){
        if(data.info.schedule[x] != 'BYE'){
            out.push(util.format('Week #%d vs %s', parseInt(x) + 1, data.info.schedule[x]));
        }else{
            out.push('-----------------------------');
        }
    }

    out.push('\n```');
    return out.join('\n');
}

cwl.prototype.gen_sheets = () => {
    var crn = 0;
    console.log('Starting to read from google sheets');
    var all_clans = {}
    async.whilst(() => {
        return crn < 4;
    }, (callback) => {
        var clans = {};
        var league_name_ = google_sheets.leagues[crn].name;
        var this_league_ = google_sheets.leagues[crn].id;
        crn++;
        console.log(util.format('Sheet #%d of 4 for league %s', crn, league_name_));
        var file_name_ = util.format('data/%s.json', league_name_);
        if(!fs.existsSync(file_name_)){
            fs.writeFileSync(file_name_, '{}');
        }
        standings_url_ = return_csv_url(this_league_, google_sheets.standings);
        schedule_url_ = return_csv_url(this_league_, google_sheets.all_schedule);
        async.waterfall([
            (callback) => {
                request.get(standings_url_, (err, res, body) => {
                    console.log('Getting standings');
                    csv({noheader: false}).fromString(body).on('csv', (row) => {
                        if(parseInt(row[1]) || parseInt(row[2])){
                            all_clans[row[0]] = {
                                tag: '',
                                league: league_name_
                            }
                            clans[row[0]] = {
                                wins: row[1],
                                loss: row[2],
                                tie: row[3],
                                pct: row[4],
                                stars_f: row[5],
                                stars_a: row[6],
                                stars_diff: row[7],
                                avg_perc: row[8],
                                st_div: row[9],
                                st_conf: row[10],
                                st_non: row[11],
                                streak: row[12],
                                schedule: [],
                                results: []
                            }
                        }
                    }).on('done', () => {
                        console.log('Got them');
                        callback(null, clans, all_clans);
                    });
                });
            },
            (clans, all_clans, callback) => {
                request.get(schedule_url_, (err, res, body) => {
                    console.log('Getting schedule');
                    csv({noheader: true}).fromString(body).on('csv', (row) => {
                        if(clans[row[0]]){
                            clans[row[0]].schedule = row.slice(1);
                        }
                    }).on('done', () => {
                        console.log('Got them');
                        callback(null, clans, all_clans);
                    });
                });
            },
            (clans, all_clans, callback) => {
                found_res = true;
                page_cnt = 0;
                console.log('Starting process to get results from each table');
                async.whilst(() => {
                    return found_res;
                }, (callback) => {
                    page_url_ = return_csv_url(this_league_, google_sheets.schedule[page_cnt++]);
                    request.get(page_url_, (err, res, body) => {
                        console.log(util.format('Table #%d', page_cnt));
                        csv({noheader: false}).fromString(body).on('csv', (row) => {
                            if(!parseInt(row[0])){
                                found_res = false;
                                if(clans[row[2]]){
                                    clans[row[2]].next_war = row[4];
                                }
                                if(clans[row[4]]){
                                    clans[row[4]].next_war = row[2];
                                }
                            }else{
                                if(clans[row[2]]){
                                    clans[row[2]].results.push({
                                        'home_stars': row[0],
                                        'home_perc': row[1],
                                        'enemy_name': row[4],
                                        'enemy_stars': row[5],
                                        'enemy_perc': row[6],
                                        'result': (row[2] == row[7] ? 'win' : 'loss')
                                    });
                                }
                                if(clans[row[4]]){
                                  clans[row[4]].results.push({
                                      'home_stars': row[5],
                                      'home_perc': row[6],
                                      'enemy_name': row[2],
                                      'enemy_stars': row[0],
                                      'enemy_perc': row[1],
                                      'result': (row[4] == row[7] ? 'win' : 'loss')
                                  });
                                }
                            }
                        }).on('done', () => {
                            callback(null, clans, all_clans);
                        });
                    });
                }, (err, clans, all_clans) => {
                    callback(null, clans, all_clans);
                });
            }
        ], (err, clans, all_clans) => {
            fs.writeFileSync(file_name_, JSON.stringify(clans, false, 4));
            callback(null, crn, all_clans);
        });
    }, (err, crn, all_clans) => {
        //fs.writeFileSync('data/clan_names2.json', JSON.stringify(all_clans, false, 4));
    });
}

cwl.prototype.get_info = (clan_name, callback) => {
    var all_clans = JSON.parse(fs.readFileSync('data/clan_names_final.json'));
    clan_name = clan_name.toLowerCase();
    async.waterfall([
        (callback) => {
            found_clan = false;
            for(x in all_clans){
                if(clan_name == x.toLowerCase() || clan_name == all_clans[x].tag.toLowerCase()){
                    found_clan = {
                        name: x,
                        tag: all_clans[x].tag,
                        league: all_clans[x].league
                    }
                }
            }
            callback(null, found_clan);
        }, (clan_info, callback) => {
            if(clan_info){
                league_clans = JSON.parse(fs.readFileSync(util.format('data/%s.json', clan_info.league)));
                callback(null, {league: clan_info.league, name: clan_info.name, tag: clan_info.tag, info: league_clans[clan_info.name]});
            }else{
                callback(null, false);
            }
        }
    ], (err, info) => {
        if(info){
            callback(err, format_info(info));
        }else{
            callback(err, 'No clan found');
        }
    });
}
module.exports = cwl;

//Initialized empty Git repository in /home/ubuntu/projects/cwl-bot/.git/
