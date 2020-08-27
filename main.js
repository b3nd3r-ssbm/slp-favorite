const { app, BrowserWindow } = require('electron');
const { default: SlippiGame } = require('@slippi/slippi-js');
const Store = require('electron-store');
const fs=require('fs');
const _ = require('underscore');
const path = require('path');
const store=new Store();
var charAdd;
if(app!== undefined){
	app.on('ready',function(){
		let win = new BrowserWindow({ 
			webPreferences: {
            			nodeIntegration: true
        		}
		});
		win.loadURL(`file://${__dirname}/index.html`);
	});
}
function startUp(){
	if(store.get('slpPath')==undefined||store.get('slpPath')==""){
		pathVis(0);
		document.getElementById("filePathText").value="Slp File Path Here";
		document.getElementById('pathWarn').style="display:inline";
	}
	else{
		document.getElementById("filePathText").value=store.get('slpPath');
	}
	if(store.get('favPath')==undefined||store.get('favPath')==""){
		if(!(store.get('slpPath')==undefined||store.get('slpPath')=="")){
			store.set('favPath',store.get('slpPath')+"\\favorites");
			fs.mkdirSync(store.get('favPath'));
			document.getElementById("favPathText").value=store.get('favPath');
		}
		else{
			pathVis(0);
			document.getElementById("favPathText").value="Slp File Path Here";
			document.getElementById('favWarn').style="display:inline";
		}
	}
	else{
		document.getElementById("favPathText").value=store.get('favPath');
	}
	if(store.get("rename")=="true"){
		document.getElementById("rename").checked=true;
		document.getElementById("namer").value=store.get("renameProtocol");
		document.getElementById("renameOpt").style="display:block";
	}
	if(store.get("copy")=="true"||store.get("copy")==true||store.get("copy")==""||store.get("copy")==undefined){
		document.getElementById("copy").checked=true;
		store.set("copy","true");
	}
	else{
		document.getElementById("move").checked=true;
	}
}
function pathVis(scen){
	switch(scen){
		case 0:
			document.getElementById('pathChange').style="display:block";
			document.getElementById('reg').style="display:none";
			break;
		case 1:
			if(store.get('slpPath')!=""&&store.get('slpPath')!=undefined&&store.get('favPath')!=""&&store.get('favPath')!=undefined){
				document.getElementById('pathChange').style="display:none";
				document.getElementById('reg').style="display:block";
			}
			break;
		case 2:
			document.getElementById('reg').style="display:none";
			document.getElementById('favFromFiles').style="display:block";
			break;
		case 3:
			document.getElementById('reg').style="display:block";
			document.getElementById('favFromFiles').style="display:none";
	}
}
function getSlpFiles(dir){
	var files = fs.readdirSync(dir);
	var slpFiles=[];
	for(var i=0;i<files.length;i++){
		if(files[i].substring(files[i].indexOf("."))==".slp"){
			slpFiles.push(files[i]);
		}
	}
	return slpFiles;
}
function getMostRecentFileName(dir) {
    var files = getSlpFiles(dir);

    // use underscore for max()
    return _.max(files, function (f) {
        var fullpath = path.join(dir, f);

        // ctime = creation time is used
        // replace with mtime for modification time
        return fs.statSync(fullpath).ctime;
    });
}
function listFav(){
	document.getElementById('favFileText').value=document.getElementById('favList').files[0];
	for(var i=0;i<document.getElementById('favList').files.length;i++){
		document.getElementById('favFileText').value+=document.getElementById('favList').files[i];
	}
}
function changePath(){
	document.getElementById("filePathText").value=document.getElementById("filePath").files[0].path.substring(0,document.getElementById("filePath").files[0].path.lastIndexOf("\\"));
	store.set('slpPath',document.getElementById("filePathText").value);
}
function changeFav(){
	document.getElementById("favPathText").value=document.getElementById("favPath").files[0].path.substring(0,document.getElementById("favPath").files[0].path.lastIndexOf("\\"));
	store.set('favPath',document.getElementById("favPathText").value);
}
function favoriteLast(){
	favorite(store.get('slpPath')+"\\"+getMostRecentFileName(store.get('slpPath')));
}
function favoriteFiles(){
	for(var i=0;i<document.getElementById("favList").files.length;i++){
		favorite(document.getElementById("favList").files[i].path);
	}
	show5("filesSaved");
}
function favorite(path){
	const pathSplit=path.split("\\");
	const gameName=pathSplit[pathSplit.length-1];
	const preGamePath=path.substring(0,path.indexOf(gameName));
	var rename=document.getElementById("namer").value;
	var newGameName;
	if(!document.getElementById("rename").checked){
		newGameName=gameName;
	}
	else{
		const game=new SlippiGame(path);
		const metadata=game.getMetadata();
		newGameName="";
		store.set("rename","true");
		store.set("renameProtocol",rename);
		console.log(rename);
		rename=rename.split(",");
		for(var i=0;i<rename.length;i++){
			//console.log(newGameName);
			newGameName+="-";
			switch(rename[i]){
				case "p1N":
					newGameName+=metadata.players[0].names.netplay;
					break;
				case "p2N":
					newGameName+=metadata.players[1].names.netplay;
					break;
				case "p1T":
					newGameName+=metadata.players[0].names.code;
					break;
				case "p2T":
					newGameName+=metadata.players[1].names.code;
					break;
				case "dd":
					newGameName+=metadata.startAt.substring(8,10);
					break;
				case "mm":
					newGameName+=metadata.startAt.substring(5,7);
					break;
				case "yyyy":
					newGameName+=metadata.startAt.substring(0,4);
					break;
				case "p1LC":
					newGameName+=longChar(game.getSettings().players[0].characterId);
					break;
				case "p2LC":
					newGameName+=longChar(game.getSettings().players[1].characterId);
					break;
				case "p1SC":
					newGameName+=shortChar(game.getSettings().players[0].characterId);
					break;
				case "p2SC":
					newGameName+=shortChar(game.getSettings().players[1].characterId);
					break;
				case "time":
					var day=new Date(metadata.startAt);
					day=day.toLocaleString('en-GB');
					newGameName+=day.substring(12,14);
					newGameName+="_";
					newGameName+=day.substring(15,17);
					newGameName+="_";
					newGameName+=day.substring(18,20);
					break;
				case "LS":
					newgameName+=longStage(game.getSettings().stageId);
					break;
				case "SS":
					newgameName+=shortStage(game.getSettings().stageId);
					break;
			}
		}
		newGameName=newGameName.substring(1);
		newGameName+=".slp";
		console.log(newGameName);
	}
	fs.renameSync(path,preGamePath+newGameName);
	fs.copyFileSync(preGamePath+newGameName,store.get('favPath')+"\\"+newGameName);
	if(!document.getElementById("copy").checked){
		fs.unlinkSync(pregamePath+newGameName);
	}
	document.getElementById('fileSaved').textContent=newGameName+" favorited";
	show5('fileSaved');
}
function toggleShow(id){
	if(document.getElementById(id).style.display=="none"){
		document.getElementById(id).style="display:inline";
	}
	else{
		document.getElementById(id).style="display:none";
	}
}
function show5(id){
	document.getElementById(id).style="display:inline";
	setTimeout(function () {
		document.getElementById(id).style="display:none";
    }, 5000);
}
function longStage(stage){
	switch(stage){
		case 2:
			return "Fountain Of Dreams";
			break;
		case 3:
			return "Pokemon Stadium";
			break;
		case 8:
			return "Yoshi's Story";
			break;
		case 28:
			return "Dream Land (64)";
			break;
		case 31:
			return "Battlefield";
			break;
		case 32:
			return "Final Destination";
			break;
	}
}
function shortStage(stage){
	switch(stage){
		case 2:
			return "FoD";
			break;
		case 3:
			return "PS";
			break;
		case 8:
			return "YS";
			break;
		case 28:
			return "DL";
			break;
		case 31:
			return "BF";
			break;
		case 32:
			return "FD";
			break;
	}
}
function longChar(charId){
	switch(charId){
		case 0:
			return "Mario";
			break;
		case 1:
			return "Fox";
			break;
		case 2:
			return "Captain Falcon";
			break;
		case 3:
			return "Donkey Kong";
			break;
		case 4:
			return "Kirby";
			break;
		case 5:
			return "Bowser";
			break;
		case 6:
			return "Link";
			break;
		case 7:
			return "Sheik";
			break;
		case 8:
			return "Ness";
			break;
		case 9:
			return "Peach";
			break;
		case 10:
			return "Ice Climbers";
			break;
		case 12:
			return "Pikachu";
			break;
		case 13:
			return "Samus";
			break;
		case 14:
			return "Yoshi";
			break;
		case 15:
			return "Jigglypuff";
			break;
		case 16:
			return "Mewtwo";
			break;
		case 17:
			return "Luigi";
			break;
		case 18:
			return "Marth";
			break;
		case 19:
			return "Zelda";
			break;
		case 20:
			return "Young Link";
			break;
		case 21:
			return "Dr. Mario";
			break;
		case 22:
			return "Falco";
			break;
		case 23:
			return "Pichu";
			break;
		case 24:
			return "Mr. Game and Watch";
			break;
		case 25:
			return "Ganondorf";
			break;
		case 26:
			return "Roy";
			break;
	}
}
function shortChar(charId){
	switch(charId){
		case 0:
			return "Mario";
			break;
		case 1:
			return "Fox";
			break;
		case 2:
			return "Falcon";
			break;
		case 3:
			return "DK";
			break;
		case 4:
			return "Kirby";
			break;
		case 5:
			return "Bowser";
			break;
		case 6:
			return "Link";
			break;
		case 7:
			return "Sheik";
			break;
		case 8:
			return "Ness";
			break;
		case 9:
			return "Peach";
			break;
		case 10:
			return "Icies";
			break;
		case 12:
			return "Pikachu";
			break;
		case 13:
			return "Samus";
			break;
		case 14:
			return "Yoshi";
			break;
		case 15:
			return "Puff";
			break;
		case 16:
			return "Mewtwo";
			break;
		case 17:
			return "Luigi";
			break;
		case 18:
			return "Marth";
			break;
		case 19:
			return "Zelda";
			break;
		case 20:
			return "YL";
			break;
		case 21:
			return "Doc";
			break;
		case 22:
			return "Falco";
			break;
		case 23:
			return "Pichu";
			break;
		case 24:
			return "GnW";
			break;
		case 25:
			return "Ganon";
			break;
		case 26:
			return "Roy";
			break;
	}
}