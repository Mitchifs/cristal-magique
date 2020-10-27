"use strict";

const Discord = require("discord.js")
const bot = new Discord.Client()
const préfixe = ","
const anecdote = ["Je vous aime tous :heart:","DEJA VU I'VE JUST BEEN IN THIS PLACE BEFORE","Ouais jsuis d'accord","Non.","En effet..","*HUM*","TG ?","La personne avant moi est la plus bête de la classe ! c:","Coucou :p","SUPPRIME OU JTE BUTE","Mmmmmmmmmmmmmmmmmmmmmmmmmm...","NYOOOOON!!!","Ce que tu viens de dire est complètement faux ! En voici la preuve : https://www.google.com/","Promis je vous ferai pas de mal","Pour qui tu te prends pour dire ça ?!","Tip#1 : Il serait temps de prendre une petite pause après tout ce temps passé devant le pc ne penses-tu pas ? c:","Tip#2 : Si vous avez la flemme, n'ayez pas la flemme c:"]
let joueurs = [
	{
		id:1234,
		groupe:"G3",
		x:0,
		y:0,
		inventaire:[],
		tête:"rien",
		torse:"rien",
		jambes:"rien",
		pieds:"rien",
		arme1:"Poings",
		arme2:"Poings",
		vie:10,
		énergie:10,
		niveau:1,
		xp:0,
		force:0,
		agilité:0,
		intelligence:0,
		points:0
	}
]
let map = [[],[],[],[],[],[],[],[]]
let partieLancee = false
let NOMBRE_FAILLES = 0
let intervalle

const plusOuMoins = nombre => {
	if(Math.floor(Math.random()*2) === 1){
		return -nombre
	}
	else{
		return nombre
	}
}

const armure = array => {
	let armure = 0
	if(array.arme1 === "Bouclier en bois" || array.arme2 === "Bouclier en bois") armure++
	if(array.tête === "Casque de motard") armure++
	if(array.jambes === "Jean") armure++
	if(array.pieds === "Paire de baskets") armure++
	return armure
}

const attaque = (array,place) => {
	let atk = 0
	if(place === 1){
		if(array.arme1 === "Hache") atk+=3
		if(array.arme1 === "Pioche") atk+=3
		if(array.arme1 === "Poings") atk+=1
		if(array.arme1 === "Bâton") atk+=2
		if(array.arme1 === "Rateau stratégique") atk+=2
		if(array.arme1 === "Epée en fer") atk+=5
	}
	if(place === 2){
		if(array.arme2 === "Hache") atk+=3
		if(array.arme2 === "Pioche") atk+=3
		if(array.arme2 === "Poings") atk+=1
		if(array.arme2 === "Bâton") atk+=2
		if(array.arme2 === "Rateau stratégique") atk+=2
		if(array.arme2 === "Epée en fer") atk+=5
	}
	return atk
}

const vieEnlevée = (array,pv) => {
	pv-=armure(array)
	if(pv < 0) pv = 0
	return pv
}

const vieMaximum = array => {
	let vieMax = 10 + array.force
	return vieMax
}

const énergieMaximum = array => {
	let énergieMax = 10 + array.agilité
	return énergieMax
}

const ajoutXP = async (array,message,xp,XP_MAX) => {
	array.xp+=xp
	while(array.xp >= XP_MAX){
		array.niveau++
		array.points++
		array.xp -= XP_MAX
		array.vie = vieMaximum(array)
		array.énergie = énergieMaximum(array)
		await message.channel.send("**:information_source: Niveau supérieur !**")
	}
	return
}

const supprimerObjet = (array,objet,quantité) => {
	for(let i = 0 ; i < quantité ; i++){
		let supprimé = false
		let j = 0
		while(!supprimé){
			if(array.inventaire[j] === objet){
				array.inventaire.splice(j,1)
				supprimé = true
			}
			j++
		}
	}
	let restant = false
	for(let i = 0 ; i < array.inventaire.length ; i++){
		if(array.inventaire[i] === objet){
			restant = true
		}
	}
	if(!restant){
		if(array.arme1 === objet) array.arme1 = "Poings"
		if(array.arme2 === objet) array.arme1 = "Poings"
		if(array.tête === objet) array.tête = "rien"
		if(array.torse === objet) array.torse = "rien"
		if(array.jambes === objet) array.jambes = "rien"
		if(array.pieds === objet) array.pieds = "rien"
	}
}

const quantitéObjet = (array,objet) => {
	let quantité = 0
	for(let i = 0 ; i < array.length ; i++){
		if(array[i] === objet) quantité++
	}
	return quantité
}

const affichageZone = (zone) => {
	let emoji = ""
	if(zone === "Plaine"){
		emoji = ":green_square:"
	}
	if(zone === "Forêt"){
		emoji = ":eight_spoked_asterisk:"
	}
	if(zone === "Ville"){
		emoji = ":city_dusk:"
	}
	if(zone === "Montagne"){
		emoji = ":white_large_square:"
	}
	if(zone === "Lac"){
		emoji = ":blue_square:"
	}
	if(zone === "Mine"){
		emoji = ":white_square_button:"
	}
	if(zone === "Base millitaire"){
		emoji = ":b:"
	}
	if(zone === "Faille spacio-temporelle"){
		emoji = ":milky_way:"
	}
	if(zone === "Espace"){
		emoji = ":black_large_square:"
	}
	if(zone === "NASA"){
		emoji = ":regional_indicator_n:"
	}
	return emoji
}

const infos = membre => {
	let i = 0;
	while(joueurs[i].id !== membre.user.id){
		i++
		if(joueurs[i] === undefined) return
	}
	let x = "?"
	let y = "?"
	if(quantitéObjet(joueurs[i].inventaire,"Carte") > 0){
		x = joueurs[i].x
		y = joueurs[i].y
	}

	let inventaire = ""
	let objets = [
		"Carte",
		"Hache",
		"Pierre",
		"Bâton",
		"Barque",
		"Combinaison d'astronaute",
		"Bûche",
		"Corde",
		"Pioche",
		"Fer brut",
		"Or brut",
		"Diamant",
		"Herbe fibreuse",
		"Feu",
		"Feu de compétition",
		"Lingot de fer",
		"Lingot d'or",
		"Plastique",
		"Carte d'accès NASA",
		"Cuir",
		"Viande de chevreuil crue",
		"Viande de chevreuil cuite",
		"Myrtille",
		"Plante médicinale",
		"Sève",
		"Pommade soignante naturelle",
		"Bouclier en bois",
		"Bouteille en plastique",
		"Paire de baskets",
		"Rateau stratégique",
		"Barre chocolatée",
		"Jean",
		"Casque de motard",
		"Baguette de pain",
		"Saucisson",
		"Verre",
		"Seringue médicale"
	]
	joueurs[i].inventaire.sort()
	for(let j = 0 ; j < objets.length ; j++){
		const quantité = quantitéObjet(joueurs[i].inventaire,objets[j])
		if(quantité > 0){
			inventaire += `${objets[j]} x${quantité}, `
		}
	}
	if(inventaire === ""){
		inventaire = "*rien*"
	}
	
	const XP_MAX = 5*2**joueurs[i].niveau //10 -> 20 -> 40 -> 80

	let haut = joueurs[i].x-1
	let bas = joueurs[i].x+1
	let gauche = joueurs[i].y-1
	let droite = joueurs[i].y+1

	if(gauche < 0){
		gauche = 7
	}
	if(droite > 7){
		droite = 0
	}
	if(haut < 0){
		haut = 7
	}
	if(bas > 7){
		bas = 0
	}

	let actionsPossibles = ""

	if(joueurs[i].points > 0){
		actionsPossibles += "*,force* : Ajouter un point dans la force\n"
		actionsPossibles += "*,agilité* : Ajouter un point dans l'agilité\n"
		actionsPossibles += "*,intelligence* : Ajouter un point dans l'intelligence\n"
	}

	if(map[haut][joueurs[i].y] === "Lac" && joueurs[i].énergie >= 1 && quantitéObjet(joueurs[i].inventaire,"Barque") > 0){
		actionsPossibles += "*,nord* : Naviguer vers le nord (x--) | -1 :zap:\n"
	}
	else if(map[haut][joueurs[i].y] !== "Lac"){
		if(map[haut][joueurs[i].y] === "Forêt"){
			if(joueurs[i].énergie >= 2) actionsPossibles += "*,nord* : Aller vers le nord (x--) | -2 :zap:\n"
		}
		else if(map[haut][joueurs[i].y] === "Montagne" || map[haut][joueurs[i].y] === "Mine"){
			if(joueurs[i].énergie >= 3) actionsPossibles += "*,nord* : Aller vers le nord (x--) | -3 :zap:\n"
		}
		else if(joueurs[i].énergie >= 1){
			actionsPossibles += "*,nord* : Aller vers le nord (x--) | -1 :zap:\n"
		}
	}
	if(map[bas][joueurs[i].y] === "Lac" && joueurs[i].énergie >= 1 && quantitéObjet(joueurs[i].inventaire,"Barque") > 0){
		actionsPossibles += "*,sud* : Naviguer vers le sud (x++) | -1 :zap:\n"
	}
	else if(map[bas][joueurs[i].y] !== "Lac"){
		if(map[bas][joueurs[i].y] === "Forêt"){
			if(joueurs[i].énergie >= 2) actionsPossibles += "*,sud* : Aller vers le sud (x++) | -2 :zap:\n"
		}
		else if(map[bas][joueurs[i].y] === "Montagne" || map[bas][joueurs[i].y] === "Mine"){
			if(joueurs[i].énergie >= 3)	actionsPossibles += "*,sud* : Aller vers le sud (x++) | -3 :zap:\n"
		}
		else if(joueurs[i].énergie >= 1){
			actionsPossibles += "*,sud* : Aller vers le sud (x++) | -1 :zap:\n"
		}
	}
	if(map[joueurs[i].x][droite] === "Lac" && joueurs[i].énergie >= 1 && quantitéObjet(joueurs[i].inventaire,"Barque") > 0){
		actionsPossibles += "*,est* : Naviguer vers l'est (y++) | -1 :zap:\n"
	}
	else if(map[joueurs[i].x][droite] !== "Lac"){
		if(map[joueurs[i].x][droite] === "Forêt"){
			if(joueurs[i].énergie >= 2)	actionsPossibles += "*,est* : Aller vers l'est (y++) | -2 :zap:\n"
		}
		else if(map[joueurs[i].x][droite] === "Montagne" || map[joueurs[i].x][droite] === "Mine"){
			if(joueurs[i].énergie >= 3)	actionsPossibles += "*,est* : Aller vers l'est (y++) | -3 :zap:\n"
		}
		else if(joueurs[i].énergie >= 1){
			actionsPossibles += "*,est* : Aller vers l'est (y++) | -1 :zap:\n"
		}
	}
	if(map[joueurs[i].x][gauche] === "Lac" && joueurs[i].énergie >= 1 && quantitéObjet(joueurs[i].inventaire,"Barque") > 0){
		actionsPossibles += "*,ouest* : Naviguer vers l'ouest (y--) | -1 :zap:\n"
	}
	else if(map[joueurs[i].x][gauche] !== "Lac"){
		if(map[joueurs[i].x][gauche] === "Forêt"){
			if(joueurs[i].énergie >= 2)	actionsPossibles += "*,ouest* : Aller vers l'ouest (y--) | -2 :zap:\n"
		}
		else if(map[joueurs[i].x][gauche] === "Montagne" || map[joueurs[i].x][gauche] === "Mine"){
			if(joueurs[i].énergie >= 3)	actionsPossibles += "*,ouest* : Aller vers l'ouest (y--) | -3 :zap:\n"
		}
		else if(joueurs[i].énergie >= 1){
			actionsPossibles += "*,ouest* : Aller vers l'ouest (y--) | -1 :zap:\n"
		}
	}

	if(map[joueurs[i].x][joueurs[i].y] === "Faille spacio-temporelle"){
		actionsPossibles += "*,traverser* : Traverser la faille\n"
	}

	if(map[joueurs[i].x][joueurs[i].y] === "Forêt" && quantitéObjet(joueurs[i].inventaire,"Hache") > 0 && joueurs[i].énergie >= 2){
		actionsPossibles += "*,couper* : Couper du bois avec ta Hache | -2 :zap:\n"
	}

	if(map[joueurs[i].x][joueurs[i].y] === "Forêt"){
		actionsPossibles += "*,baton* : Ramasser un bâton par terre\n"
	}

	if(map[joueurs[i].x][joueurs[i].y] === "Plaine"){
		actionsPossibles += "*,herbe* : Ramasser de l'herbe fibreuse\n"
	}

	if(map[joueurs[i].x][joueurs[i].y] === "Forêt" && joueurs[i].énergie >= 2){
		actionsPossibles += "*,chasser* : Chasser de la nourriture | -2 :zap:\n"
	}

	if(map[joueurs[i].x][joueurs[i].y] === "Montagne" || map[joueurs[i].x][joueurs[i].y] === "Mine"){
		actionsPossibles += "*,pierre* : Ramasser une pierre par terre\n"
	}

	if(map[joueurs[i].x][joueurs[i].y] === "Mine" && quantitéObjet(joueurs[i].inventaire,"Pioche") > 0 && joueurs[i].énergie >= 2){
		actionsPossibles += "*,miner* : Miner du minerais avec ta Pioche | -2 :zap:\n"
	}

	if(map[joueurs[i].x][joueurs[i].y] === "Ville" && joueurs[i].énergie >= 1){
		actionsPossibles += "*,fouiller* : Fouiller la ville | -1 :zap:\n"
	}

	if(map[joueurs[i].x][joueurs[i].y] === "NASA" && joueurs[i].énergie >= 1 && quantitéObjet(joueurs[i].inventaire,"Carte d'accès NASA") > 0){
		actionsPossibles += "*,fouiller* : Fouiller la NASA | -1 :zap:\n"
	}

	if(map[joueurs[i].x][joueurs[i].y] === "Base millitaire" && joueurs[i].énergie >= 1){
		actionsPossibles += "*,fouiller* : Fouiller la base millitaire | -1 :zap:\n"
	}

	if(actionsPossibles === ""){
		actionsPossibles = "Tu ne peux rien faire ! Attends un peu pour récupérer de l'énergie... "
	}

	const embed = new Discord.MessageEmbed()
	.setTitle("Informations :")
	.setDescription(`**Actions possibles** : \n${actionsPossibles}`)
	.addField("Position :",`*X* : ${x}\n*Y* : ${y}\n:black_large_square:${affichageZone(map[haut][joueurs[i].y])}:black_large_square:\n${affichageZone(map[joueurs[i].x][gauche])}${affichageZone(map[joueurs[i].x][joueurs[i].y])}${affichageZone(map[joueurs[i].x][droite])}\n:black_large_square:${affichageZone(map[bas][joueurs[i].y])}:black_large_square:`,true)
	.addField("Stats :",`*Force* : ${joueurs[i].force}\n*Agilité* : ${joueurs[i].agilité}\n*Intell.* : ${joueurs[i].intelligence}\n*Points* : ${joueurs[i].points}`,true)
	.addField("Etat :",`*Vie :heart:* : ${joueurs[i].vie}/${vieMaximum(joueurs[i])}\n*Energie :zap:* : ${joueurs[i].énergie}/${énergieMaximum(joueurs[i])}\n*Niveau* : ${joueurs[i].niveau}\n*XP* : ${joueurs[i].xp}/${XP_MAX}`,true)
	.addField("Equipement :",`*Armure :shield:* : ${armure(joueurs[i])}\n*Arme 1* : ${joueurs[i].arme1} | ${attaque(joueurs[i],1)} :crossed_swords:\n*Arme 2* : ${joueurs[i].arme2} | ${attaque(joueurs[i],2)} :crossed_swords:\n*Tête* : ${joueurs[i].tête}\n*Torse* : ${joueurs[i].torse}\n*Jambes* : ${joueurs[i].jambes}\n*Pieds* : ${joueurs[i].pieds}`,true)
	.addField("Inventaire :",`\n${inventaire}`,true)
	.setColor("#abf6a5")
	.setFooter(`${membre.displayName} | ${joueurs[i].groupe} | ${préfixe}craft | ${préfixe}équiper | ${préfixe}consommer`)
	return embed
}

bot.on("ready", async () => {
	console.log("C'est parti !")
	bot.user.setPresence({
		activity:{
			name:",help",
			type:"PLAYING"
		},
		status:"online"
	})
	.catch(console.error)
	bot.generateInvite({
		permissions:[
		"MANAGE_GUILD",
		"MANAGE_ROLES",
		"MANAGE_CHANNELS",
		"KICK_MEMBERS",
		"BAN_MEMBERS",
		"CREATE_INSTANT_INVITE",
		"CHANGE_NICKNAME",
		"MANAGE_NICKNAMES",
		"MANAGE_EMOJIS",
		"SEND_MESSAGES",
		"MANAGE_MESSAGES",
		"EMBED_LINKS",
		"ATTACH_FILES",
		"READ_MESSAGE_HISTORY",
		"MENTION_EVERYONE",
		"USE_EXTERNAL_EMOJIS",
		"ADD_REACTIONS",
		"CONNECT",
		"SPEAK",
		"MUTE_MEMBERS",
		"DEAFEN_MEMBERS",
		"MOVE_MEMBERS",
		"USE_VAD"
	]
})
	.then(lien => console.log(lien))
	.catch(console.error)
})

bot.on("message", async message => {
	if(message.author.bot) return
	const serveur = bot.guilds.cache.get("767810173690576936")
	if(message.content.startsWith(préfixe)){

		if(/^.roue\s*pompes$/i.test(message.content)){
			const x = Math.floor(Math.random()*100)
			let résultat = ""
			let couleur = ""
			if(x < 20){
				résultat = "Grâce" //20%
				couleur = "#2ecc71" //vert
			}
			else if(x < 30){
				résultat = "40 pompes" //10%
				couleur = "#000000" //noir
			}
			else if(x < 60){
				résultat = "20 pompes" //30%
				couleur = "#e67e22" //orange
			}
			else{
				résultat = "10 pompes" //40%
				couleur = "#3498db" //bleu
			}
			const embed = new Discord.MessageEmbed()
			.setTitle("Roue pompes")
			.setDescription("Résultat : **" + résultat + "** !")
			.setColor(couleur)
			message.channel.send(embed)
		}
	
		else if(/^.liens$/i.test(message.content)){
			const embed = new Discord.MessageEmbed()
			.setTitle("Liens :")
			.addField("Boîte Mail","https://partage.insa-rouen.fr/")
			.addField("Moodle","https://moodle.insa-rouen.fr/")
			.addField("ENT","https://ent.normandie-univ.fr/")
			.setColor("#abf6a5")
			message.channel.send(embed)
		}

		else if(/^.stats$/i.test(message.content)){
			let G1 = 0;
			let G2 = 0;
			const membresTotaux = serveur.memberCount
			const membres = (await serveur.members.fetch()).array()
			for(let i = 0 ; i < membres.length ; i++){
				if(membres[i].roles.cache.some(role => role.name === "G1")){
					G1++
				}
				if(membres[i].roles.cache.some(role => role.name === "G2")){
					G2++
				}
			}
			const embed = new Discord.MessageEmbed()
			.setTitle("Stats :")
			.setDescription(`**Membres totaux (avec bot)** : ${membresTotaux}\n**Nb de G1** : ${G1}\n**Nb de G2** : ${G2}\n**Date de création du serveur** : ${serveur.createdAt.toLocaleDateString("fr-FR",{timeZone:"Europe/paris",hour12:false})}\n**Heure de création du serveur** : ${serveur.createdAt.toLocaleTimeString("fr-FR",{timeZone:"Europe/Paris",hour12:false})}`)
			.setColor("#abf6a5")
			message.channel.send(embed)
		}

		else if(/^.lancer\s*une\s*partie$/i.test(message.content) && !partieLancee && message.author.id === "333621078050078730"){
			partieLancee = true
			
			for(let x = 0 ; x < 8 ; x++){
				for(let y = 0 ; y < 8 ; y++){
					map[x][y] = "Plaine"
				}
			}
			const NOMBRE_MONTAGNES = Math.floor(Math.random()*2)+1
			for(let i = 0 ; i < NOMBRE_MONTAGNES ; i++){
				const origineX = Math.floor(Math.random()*8)
				const origineY = Math.floor(Math.random()*8)
				const rayon = Math.floor(Math.random()*2)+1
				for(let x = 0 ; x < 8 ; x++){
					for(let y = 0 ; y < 8 ; y++){
						if(Math.sqrt((x-origineX)**2 + (y-origineY)**2) <= rayon){
							map[x][y] = "Montagne"
						}
					}
				}
			}
			const NOMBRE_LACS = Math.floor(Math.random()*2)+1
			for(let i = 0 ; i < NOMBRE_LACS ; i++){
				let origineX = Math.floor(Math.random()*8)
				let origineY = Math.floor(Math.random()*8)
				while(map[origineX][origineY] !== "Plaine"){
					origineX = Math.floor(Math.random()*8)
					origineY = Math.floor(Math.random()*8)
				}
				const rayon = Math.floor(Math.random()*2)+1
				for(let x = 0 ; x < 8 ; x++){
					for(let y = 0 ; y < 8 ; y++){
						if(Math.sqrt((x-origineX)**2 + (y-origineY)**2) <= rayon){
							if(map[x][y] === "Plaine"){
								map[x][y] = "Lac"
							}
						}
					}
				}
			}
			const NOMBRE_FORETS = Math.floor(Math.random()*3)+1
			for(let i = 0 ; i < NOMBRE_FORETS ; i++){
				let origineX = Math.floor(Math.random()*8)
				let origineY = Math.floor(Math.random()*8)
				while(map[origineX][origineY] !== "Plaine"){
					origineX = Math.floor(Math.random()*8)
					origineY = Math.floor(Math.random()*8)
				}
				const rayon = 1
				for(let x = 0 ; x < 8 ; x++){
					for(let y = 0 ; y < 8 ; y++){
						if(Math.sqrt((x-origineX)**2 + (y-origineY)**2) <= rayon){
							if(map[x][y] === "Plaine"){
								map[x][y] = "Forêt"
							}
						}
					}
				}
			}
			const NOMBRE_VILLES = Math.floor(Math.random()*4)+1
			for(let i = 0 ; i < NOMBRE_VILLES ; i++){
				let origineX = Math.floor(Math.random()*8)
				let origineY = Math.floor(Math.random()*8)
				while(map[origineX][origineY] !== "Plaine"){
					origineX = Math.floor(Math.random()*8)
					origineY = Math.floor(Math.random()*8)
				}
				map[origineX][origineY] = "Ville"
			}
			let NOMBRE_MINES = Math.floor(Math.random()*(NOMBRE_MONTAGNES+1))+1
			for(let i = 0 ; i < NOMBRE_MINES ; i++){
				let origineX = Math.floor(Math.random()*8)
				let origineY = Math.floor(Math.random()*8)
				while(map[origineX][origineY] !== "Montagne"){
					origineX = Math.floor(Math.random()*8)
					origineY = Math.floor(Math.random()*8)
				}
				map[origineX][origineY] = "Mine"
			}
			const NOMBRE_BASES_MILLITAIRES = Math.floor(Math.random()*3)
			for(let i = 0 ; i < NOMBRE_BASES_MILLITAIRES ; i++){
				let origineX = Math.floor(Math.random()*8)
				let origineY = Math.floor(Math.random()*8)
				while(map[origineX][origineY] !== "Plaine"){
					origineX = Math.floor(Math.random()*8)
					origineY = Math.floor(Math.random()*8)
				}
				map[origineX][origineY] = "Base millitaire"
			}
			NOMBRE_FAILLES = Math.floor(Math.random()*3)
			for(let i = 0 ; i < NOMBRE_FAILLES ; i++){
				let origineX = Math.floor(Math.random()*8)
				let origineY = Math.floor(Math.random()*8)
				while(map[origineX][origineY] !== "Plaine"){
					origineX = Math.floor(Math.random()*8)
					origineY = Math.floor(Math.random()*8)
				}
				map[origineX][origineY] = "Faille spacio-temporelle"
			}
			const NOMBRE_NASA = Math.floor(Math.random()*2)
			for(let i = 0 ; i < NOMBRE_NASA ; i++){
				let origineX = Math.floor(Math.random()*8)
				let origineY = Math.floor(Math.random()*8)
				while(map[origineX][origineY] !== "Plaine"){
					origineX = Math.floor(Math.random()*8)
					origineY = Math.floor(Math.random()*8)
				}
				map[origineX][origineY] = "NASA"
			}

			let membres = (await serveur.members.fetch()).array()

			for(let i = 0 ; i < membres.length ; i++){
				if(membres[i].roles.cache.some(role => role.name === "G1")){
					let x = Math.floor(Math.random()*8)
					let y = Math.floor(Math.random()*8)
					while(map[x][y] === "Lac"){
						x = Math.floor(Math.random()*8)
						y = Math.floor(Math.random()*8)
					}
					joueurs.push({
						id:membres[i].user.id,
						groupe:"G1",
						x:x,
						y:y,
						inventaire:[],
						tête:"rien",
						torse:"rien",
						jambes:"rien",
						pieds:"rien",
						arme1:"Poings",
						arme2:"Poings",
						vie:10,
						énergie:10,
						niveau:1,
						xp:0,
						force:0,
						agilité:0,
						intelligence:0,
						points:0
					})
					//await membres[i].user.send(infos(membres[i]))
				}
				if(membres[i].roles.cache.some(role => role.name === "G2")){
					let x = Math.floor(Math.random()*8)
					let y = Math.floor(Math.random()*8)
					while(map[x][y] === "Lac"){
						x = Math.floor(Math.random()*8)
						y = Math.floor(Math.random()*8)
					}
					joueurs.push({
						id:membres[i].user.id,
						groupe:"G2",
						x:x,
						y:y,
						inventaire:[],
						tête:"rien",
						torse:"rien",
						jambes:"rien",
						pieds:"rien",
						arme1:"Poings",
						arme2:"Poings",
						vie:10,
						énergie:10,
						niveau:1,
						xp:0,
						force:0,
						agilité:0,
						intelligence:0,
						points:0
					})
					//await membres[i].user.send(infos(membres[i]))
				}
			}

			intervalle = bot.setInterval(() => {
				for(let i = 0 ; i < joueurs.length ; i++){
					if(joueurs[i].énergie < énergieMaximum(joueurs[i])) joueurs[i].énergie++
					if(joueurs[i].énergie >= 10 && joueurs[i].vie < vieMaximum(joueurs[i])) joueurs[i].vie++
				}
			},30000)

			let carte = ""
			for(let x = 0 ; x < 8 ; x++){
				for(let y = 0 ; y < 8 ; y++){
					carte += affichageZone(map[x][y])
					if(y === 7){
						carte += "\n"
					}
				}
			}
			message.channel.send(carte + "\n**:information_source: PARTIE LANCEE**")
		}

		else if(/^.help$/i.test(message.content)){
			const embed = new Discord.MessageEmbed()
			.setTitle("Commandes :")
			.setDescription(`**${préfixe}roue pompes** : Lancer la roue des pompes\n**${préfixe}liens** : Lien utiles de l'INSA\n**${préfixe}stats** : Statistiques du serveur\n**${préfixe}wiki** : Wiki de :zap:__G1 VS G2__ :zap:`)
			.setColor("#abf6a5")
			message.channel.send(embed)
		}

		else if(/^.wiki$/i.test(message.content)){
			const embed = new Discord.MessageEmbed()
			.setTitle("Wiki :")
			.setDescription(`Voici les commandes du wiki du jeu de Cristal Magique j'ai nommé __:zap: G1 VS G2 :zap:__ !!! :\n\n**${préfixe}tuto consommables** : Tout sur comment utiliser des consommables\n**${préfixe}tuto zones** : Tout sur les zones\n**${préfixe}tuto crafts** : Tout sur les crafts\n**${préfixe}tuto actions** : Tout sur les actions\n**${préfixe}tuto position** : Tout sur la position\n**${préfixe}tuto stats** : Tout sur les stats\n**${préfixe}tuto etat** : Tout sur les états\n**${préfixe}tuto equipement** : Tout sur l'équipement\n**${préfixe}tuto inventaire** : Tout sur l'inventaire`)
			.setColor("#abf6a5")
			message.channel.send(embed)
		}

		else if(/^.tuto\s*consommables$/i.test(message.content)){
			const embed = new Discord.MessageEmbed()
			.setTitle("Tuto : Les consommables")
			.setDescription(`Il t'arrivera souvent de crafter ou de trouver des consommables ! Pour voir les objets de ton inventaire que tu peux consommer **,consommer** (ces actions n'apparaîtrons pas dans le menu d'actions possibles (car faisables tout le temps, ça embrouillerait plus qu'autre chose))`)
			.setColor("#abf6a5")
			message.channel.send(embed)
		}

		else if(/^.tuto\s*zones$/i.test(message.content)){
			const embed = new Discord.MessageEmbed()
			.setTitle("Tuto : Les zones")
			.setDescription(`Les zones sont les différents endroits sur lesquels tu peux te déplacer pendant une partie. Voici leur liste ainsi que leur fonction :\n\n**:green_square: Plaine** :\nUne zone qui ne coûte que 1 d'énergie (:zap:) pour être traversée. Elle permet d'y construire sa base\n\n**:eight_spoked_asterisk: Forêt :**\nNécessaire pour y couper du bois afin de craft de nombreux items. En la traversant tu perdras 2 :zap:\n\n**:white_large_square: Montagne :**\nL'endroit qui coûte le plus d'énergie pour être traversé : 3 :zap:. Permet également de récolter de la pierre et on peut y trouver des mines qui elles sont extrêment utiles !\n\n**:blue_square: Lac :**\nInfranchissable sans barque\n\n**:city_dusk: Ville :**\nTrès utile pour trouver de l'équipement et des ingrédients de craft\n\n**:white_square_button: Mine :**\nOn peut y récolter du minerais précieux pour confectionner des choses plus avancées\n\n**:b: Base millitaire :**\nAvec 1 ou 2 "l" ? Jsp mais j'en mets 2 en tout cas. En tout cas sah quel plaisir cet endroit bien que très rare !\n\n**:milky_way: Faille spacio-temporelle :**\n???\n\n**:regional_indicator_n: NASA :**\n???`)
			.setColor("#abf6a5")
			message.channel.send(embed)
		}

		else if(/^.tuto\s*crafts$/i.test(message.content)){
			const embed = new Discord.MessageEmbed()
			.setTitle("Tuto : Les crafts")
			.setDescription(`Les crafts sont les manières de fabriquer un objet à partir d'autres objets. En gros bah c'est comme dans Minecraft dans une table de craft !\n\nVu que je suis une personne horrible je vous donne pas la liste des crafts et il faut que vous les découvriez vous-même (si vous avez assez d'intelligence :smiling_imp:) !\n\nPour voir les objets de ton inventaire qui sont craftables : **,crafts** (ces actions n'apparaîtrons pas dans le menu d'actions possibles (car faisables tout le temps, ça embrouillerait plus qu'autre chose))`)
			.setColor("#abf6a5")
			message.channel.send(embed)
		}

		else if(/^.tuto\s*actions$/i.test(message.content)){
			const embed = new Discord.MessageEmbed()
			.setTitle("Tuto : Les actions")
			.setDescription(`Les actions sont un must-know pour survivre et tuer tout le groupe adverse ! En effectuant la commande **${préfixe}jouer** tu pourras faire apparaître le superbe menu d'informations avec en première ligne les actions (il peut apparaître automatiquement parfois) !\nLes actions dépendent de la zone où tu es et de ce que tu es (énergie, inventaire,...) !\nPour faire une action, il te suffit d'écrire une commande que la liste des actions possibles te propose !\nSache qu'au fil du temps les actions changeront en fonction de se qu'il se passe en temps réel et malheureusement ton menu d'information ne s'actualise pas automatiquement :/ Donc si ça fait un petit bout de temps que tu n'as pas fait d'actions prends en compte qu'il est possible que de nouvelles actions se soient offertes à toi ou que les anciennes ont disparues ! Un petit **${préfixe}jouer** dans ta situation te permettra de tout remettre à jour comme il faut ! c:\n\n*PS : Essaie pas de cheater je suis trop malin pour laisser des failles dans mes programmes :p*`)
			.setColor("#abf6a5")
			message.channel.send(embed)
		}

		else if(/^.tuto\s*position$/i.test(message.content)){
			const embed = new Discord.MessageEmbed()
			.setTitle("Tuto : Ta position")
			.setDescription(`Bonsoir ! Alors comme ça tu ne comprends pas où tu es ni comment nanani et nanana ?\n\nBah c'est tout simple ! Sous l'onglet **Position** du menu d'information tu peux voir tes coordonnées X et Y (ou pas si t'as pas encore de carte) ! Ces coordonnées correspondent à ta position sur la map qui fait du 8x8 soit 64 cases possibles au total !\n\nTon couple de coordonnées correspond également à une certaine zone (**,zones**) !\n\nSi tu dépasses une certaine limite de coordonnées tu apparaitras de l'autre côté de la carte ! Tu peux donc aller à l'infini vers la même direction comme sur la Terre :p\n\nJuste en dessous de tes coordonnées tu trouveras une mini-carte qui te montre sur quelle zone tu es (au centre) et quelles sont les zones qui t'entourent (nord, sud, est et ouest)\nSi tu as suffisament d'énergie, tu l'auras compris, tu peux te déplacer dans l'une de ces zones qui t'entourent et ainsi faire apparaître une nouvelle fois celles qui t'entourent etc...\n\nSi t'es un peu perdu au début c'est normal mais on s'y habitue avec le temps :p\n\nAh oui et les coordonnées en terme d'axes c'est un peu le bazar, du coup je te laisse regarder cette magnifique image pour comprendre c: :`)
			.setImage("https://i.imgur.com/pg780uZ.png")
			.setColor("#abf6a5")
			message.channel.send(embed)
		}

		else if(/^.tuto\s*stats$/i.test(message.content)){
			const embed = new Discord.MessageEmbed()
			.setTitle("Tuto : Les stats")
			.setDescription(`Les stats, quelle fonctionnalité géniale ! Elles sont au nombre de 3 : **force, agilité et intelligence**, laisse moi t'expliquer tout sur elles !\n\nEn faisant certaines actions tu gagneras de l'XP, quand cet XP atteindra un certain seuil, tu passeras 1 niveau (comme dans un RPG !) ce qui te rendra toute ta vie et ton énergie et tu gagneras alors un point de compétence à attribuer dans la force, l'agilité ou l'intelligence ! Voici à quoi servent ces stats :\n\n**Force :**\nChaque point augmente ta vie maximum de 1 !\n\n**Agilité :**\nChaque point augmente ton énergie maximum de 1 !\n\n**Intelligence :**\nPlus tu en as, plus tu peux connaître des crafts plus complexes (donc oui parfois tu peux te dire *"ptn il est relou Manuel c'est logique de craft ça mais il l'a pas créé"* bah en fait c'est juste que t'es pas assez intelligent :p (t'as le seum ?))`)
			.setColor("#abf6a5")
			message.channel.send(embed)
		}

		else if(/^.tuto\s*[eé]tat$/i.test(message.content)){
			const embed = new Discord.MessageEmbed()
			.setTitle("Tuto : Les états")
			.setDescription(`Les états correspondent à la vie et l'énergie, laisse moi préciser :\n\n**Energie :zap: :**\nTon énergie est un mélange de faim et de peps, tu peux en récupérer en mangeant quelque chose (trouvable ou craftable) ou naturellement 1 toutes les 30 secondes ! Elle te permet de te déplacer, crafter et te battre ce qui la rend donc très importante ! Sache que les combats contre la team adverse se joueront en partie en fonction de celui qui gère le mieux sont énergie...\n\n**Vie :heart: :**\nLa vie est le plus important, en fait si tu en as plus, bah tu meurs, logique non ? Et impossible de te réssuiciter (enfin je crois ?). Tu en récupères 1 toutes les 30 secondes si ton énergie est supérieure ou égale à 10 et tu peux aussi en récupérer en te soigant avec certains objets. Et évidemment tu en perds si tu te bats ou si tu fais des bétises débiles`)
			.setColor("#abf6a5")
			message.channel.send(embed)
		}

		else if(/^.tuto\s*[eé]quipement$/i.test(message.content)){
			const embed = new Discord.MessageEmbed()
			.setTitle("Tuto : L'équipement")
			.setDescription(`Ton équipement est quelque chose de très important ! Déjà, se sont tes armes qui te permettront de te battre (enlever de la vie à quelqu'un) ou de te défendre grâce à l'armure :shield: ! L'armure réduit de façon permanente des dégâts que tu es censé subir donc elle est très utile !\n\nPlus ton équipement est dur à trouver/confectionner, plus il te rendra fort et invincible !\n\nPour voir les objets de ton inventaire qui sont équipables : **,équiper** (ces actions n'apparaîtrons pas dans le menu d'actions possibles (car faisables tout le temps, ça embrouillerait plus qu'autre chose))`)
			.setColor("#abf6a5")
			message.channel.send(embed)
		}

		else if(/^.tuto\s*inventaire$/i.test(message.content)){
			const embed = new Discord.MessageEmbed()
			.setTitle("Tuto : L'inventaire")
			.setDescription(`J'ai vraiment besoin de détailler ça ? Bah en gros dès que tu trouves des trucs ils vont direct dans ton inventaire (ton inventaire est illimité en terme de place car je suis gentil et j'ai la flemme aussi). Tu peux équiper des objets de ton inventaire ou les utiliser pour confectionner des objets encore plus utiles !`)
			.setColor("#abf6a5")
			message.channel.send(embed)
		}

		else if(partieLancee){
			let membres = await serveur.members.fetch()
			if(membres.some(m => m.user.id === message.author.id)){
				const membre = membres.find(m => m.user.id === message.author.id)
				if(!membre.roles.cache.some(r => r.name === "G1" || r.name === "G2")) return

				if(/^.annuler\s*la\s*partie$/i.test(message.content)){
					joueurs = []
					map = [[],[],[],[],[],[],[],[]]
					partieLancee = false
					bot.clearInterval(intervalle)
					message.channel.send("**:information_source: PARTIE ANNULEE**")
					return
				}

				let i = 0;
				while(joueurs[i].id !== membre.user.id){
					i++
					if(joueurs[i] === undefined) return
				}
				let haut = joueurs[i].x-1
				let bas = joueurs[i].x+1
				let gauche = joueurs[i].y-1
				let droite = joueurs[i].y+1

				if(gauche < 0){
					gauche = 7
				}
				if(droite > 7){
					droite = 0
				}
				if(haut < 0){
					haut = 7
				}
				if(bas > 7){
					bas = 0
				}

				const XP_MAX = 5*2**joueurs[i].niveau //10 -> 20 -> 40 -> 80

				if(/^.nord$/.test(message.content)){
					if(map[haut][joueurs[i].y] === "Lac"){
						if(quantitéObjet(joueurs[i].inventaire,"Barque") > 0){
							if(joueurs[i].énergie >= 1){
								joueurs[i].x--
								if(joueurs[i].x < 0) joueurs[i].x = 7
								joueurs[i].énergie-=1
								message.channel.send(infos(membre))
							}
							else message.channel.send("**:information_source: Tu n'as pas assez d'énergie, mange un truc ou attends un peu ! (+1/30s)**")
						}
						else{
							message.channel.send("**:information_source: Tu ne peux pas marcher sur un lac !**")
						}
					}
					else if(map[haut][joueurs[i].y] === "Montagne" || map[haut][joueurs[i].y] === "Mine"){
						if(joueurs[i].énergie >=3){
							joueurs[i].x--
							if(joueurs[i].x < 0) joueurs[i].x = 7
							joueurs[i].énergie-=3
							message.channel.send(infos(membre))
						}
						else message.channel.send("**:information_source: Tu n'as pas assez d'énergie, mange un truc ou attends un peu ! (+1/30s)**")
					}
					else if(map[haut][joueurs[i].y] === "Forêt"){
						if(joueurs[i].énergie >= 2){
							joueurs[i].x--
							if(joueurs[i].x < 0) joueurs[i].x = 7
							joueurs[i].énergie-=2
							message.channel.send(infos(membre))
						}
						else message.channel.send("**:information_source: Tu n'as pas assez d'énergie, mange un truc ou attends un peu ! (+1/30s)**")
					}
					else if(joueurs[i].énergie >= 1){
						joueurs[i].x--
						if(joueurs[i].x < 0) joueurs[i].x = 7
						joueurs[i].énergie-=1
						message.channel.send(infos(membre))
					}
					else{
						message.channel.send("**:information_source: Tu n'as pas assez d'énergie, mange un truc ou attends un peu ! (+1/30s)**")
					}
				}

				else if(/^.sud$/.test(message.content)){
					if(map[bas][joueurs[i].y] === "Lac"){
						if(quantitéObjet(joueurs[i].inventaire,"Barque") > 0){
							if(joueurs[i].énergie >= 1){
								joueurs[i].x++
								if(joueurs[i].x > 7) joueurs[i].x = 0
								joueurs[i].énergie-=1
								message.channel.send(infos(membre))
							}
							else message.channel.send("**:information_source: Tu n'as pas assez d'énergie, mange un truc ou attends un peu ! (+1/30s)**")
						}
						else{
							message.channel.send("**:information_source: Tu ne peux pas marcher sur un lac !**")
						}
					}
					else if(map[bas][joueurs[i].y] === "Montagne" || map[bas][joueurs[i].y] === "Mine"){
						if(joueurs[i].énergie >=3){
							joueurs[i].x++
							if(joueurs[i].x > 7) joueurs[i].x = 0
							joueurs[i].énergie-=3
							message.channel.send(infos(membre))
						}
						else message.channel.send("**:information_source: Tu n'as pas assez d'énergie, mange un truc ou attends un peu ! (+1/30s)**")
					}
					else if(map[bas][joueurs[i].y] === "Forêt"){
						if(joueurs[i].énergie >= 2){
							joueurs[i].x++
							if(joueurs[i].x > 7) joueurs[i].x = 0
							joueurs[i].énergie-=2
							message.channel.send(infos(membre))
						}
						else message.channel.send("**:information_source: Tu n'as pas assez d'énergie, mange un truc ou attends un peu ! (+1/30s)**")
					}
					else if(joueurs[i].énergie >= 1){
						joueurs[i].x++
						if(joueurs[i].x > 7) joueurs[i].x = 0
						joueurs[i].énergie-=1
						message.channel.send(infos(membre))
					}
					else{
						message.channel.send("**:information_source: Tu n'as pas assez d'énergie, mange un truc ou attends un peu ! (+1/30s)**")
					}
				}

				else if(/^.est$/.test(message.content)){
					if(map[joueurs[i].x][droite] === "Lac"){
						if(quantitéObjet(joueurs[i].inventaire,"Barque") > 0){
							if(joueurs[i].énergie >= 1){
								joueurs[i].y++
								if(joueurs[i].y > 7) joueurs[i].y = 0
								joueurs[i].énergie-=1
								message.channel.send(infos(membre))
							}
							else message.channel.send("**:information_source: Tu n'as pas assez d'énergie, mange un truc ou attends un peu ! (+1/30s)**")
						}
						else{
							message.channel.send("**:information_source: Tu ne peux pas marcher sur un lac !**")
						}
					}
					else if(map[joueurs[i].x][droite] === "Montagne" || map[joueurs[i].x][droite] === "Mine"){
						if(joueurs[i].énergie >=3){
							joueurs[i].y++
							if(joueurs[i].y > 7) joueurs[i].y = 0
							joueurs[i].énergie-=3
							message.channel.send(infos(membre))
						}
						else message.channel.send("**:information_source: Tu n'as pas assez d'énergie, mange un truc ou attends un peu ! (+1/30s)**")
					}
					else if(map[joueurs[i].x][droite] === "Forêt"){
						if(joueurs[i].énergie >= 2){
							joueurs[i].y++
							if(joueurs[i].y > 7) joueurs[i].y = 0
							joueurs[i].énergie-=2
							message.channel.send(infos(membre))
						}
						else message.channel.send("**:information_source: Tu n'as pas assez d'énergie, mange un truc ou attends un peu ! (+1/30s)**")
					}
					else if(joueurs[i].énergie >= 1){
						joueurs[i].y++
						if(joueurs[i].y > 7) joueurs[i].y = 0
						joueurs[i].énergie-=1
						message.channel.send(infos(membre))
					}
					else{
						message.channel.send("**:information_source: Tu n'as pas assez d'énergie, mange un truc ou attends un peu ! (+1/30s)**")
					}
				}

				else if(/^.ouest$/.test(message.content)){
					if(map[joueurs[i].x][gauche] === "Lac"){
						if(quantitéObjet(joueurs[i].inventaire,"Barque") > 0){
							if(joueurs[i].énergie >= 1){
								joueurs[i].y--
								if(joueurs[i].y < 0) joueurs[i].y = 7
								joueurs[i].énergie-=1
								message.channel.send(infos(membre))
							}
							else message.channel.send("**:information_source: Tu n'as pas assez d'énergie, mange un truc ou attends un peu ! (+1/30s)**")
						}
						else{
							message.channel.send("**:information_source: Tu ne peux pas marcher sur un lac !**")
						}
					}
					else if(map[joueurs[i].x][gauche] === "Montagne" || map[joueurs[i].x][gauche] === "Mine"){
						if(joueurs[i].énergie >=3){
							joueurs[i].y--
							if(joueurs[i].y < 0) joueurs[i].y = 7
							joueurs[i].énergie-=3
							message.channel.send(infos(membre))
						}
						else message.channel.send("**:information_source: Tu n'as pas assez d'énergie, mange un truc ou attends un peu ! (+1/30s)**")
					}
					else if(map[joueurs[i].x][gauche] === "Forêt"){
						if(joueurs[i].énergie >= 2){
							joueurs[i].y--
							if(joueurs[i].y < 0) joueurs[i].y = 7
							joueurs[i].énergie-=2
							message.channel.send(infos(membre))
						}
						else message.channel.send("**:information_source: Tu n'as pas assez d'énergie, mange un truc ou attends un peu ! (+1/30s)**")
					}
					else if(joueurs[i].énergie >= 1){
						joueurs[i].y--
						if(joueurs[i].y < 0) joueurs[i].y = 7
						joueurs[i].énergie-=1
						message.channel.send(infos(membre))
					}
					else{
						message.channel.send("**:information_source: Tu n'as pas assez d'énergie, mange un truc ou attends un peu ! (+1/30s)**")
					}
				}

				else if(/^.énergie$/.test(message.content)){
					joueurs[i].énergie = 10
					message.channel.send(infos(membre))
				}
	
				else if(/^.jouer$/i.test(message.content) && membre.roles.cache.some(r => r.name === "BETA")){
					message.channel.send(infos(membre))
				}

				else if(/^.traverser$/i.test(message.content)){
					if(map[joueurs[i].x][joueurs[i].y]){
						if(NOMBRE_FAILLES === 1){
							if(quantitéObjet(joueurs[i].inventaire,"Combinaison d'astronaute") > 0){

							}
							else{
								joueurs[i].vie = 0
								message.channel.send("**:skull: En traversant la faille tu te retrouves téléporté à son autre bout qui se situe malheureusement au plein milieu de l'espace. Le portail ayant subi une grosse instabilité, il se referme juste après ton passage. Après avoir retenu ta respiration pendant une trentaine de secondes, le manque d'oxygène te tue dans d'attroces souffrance et dans le silence absolu...**")
								joueurs.splice(i,1)
							}
						}
						else if(NOMBRE_FAILLES === 2){
							let xArrivée = joueurs[i].x
							let yArrivée = joueurs[i].y
							while(xArrivée === joueurs[i].x && yArrivée === joueurs[i].y){
								for(let x = 0 ; x < 8 ; x++){
									for(let y = 0 ; y < 8 ; y++){
										if(map[x][y] === "Faille spacio-temporelle" && x !== joueurs[i].x && y !== joueurs[i].y){
											xArrivée = x
											yArrivée = y
											break
										}
									}
								}
							}
							map[joueurs[i].x][joueurs[i].y] = "Plaine"
							map[xArrivée][yArrivée] = "Plaine"
							joueurs[i].x = xArrivée
							joueurs[i].y = yArrivée
							await message.channel.send("**:information_source: En traversant la faille tu te retrouves téléporté à son autre bout qui se situe autre part dans la zone de jeu. Le portail ayant subi une grosse instabilité, il se referme juste après ton passage.**")
							message.channel.send(infos(membre))
						}
					}
				}

				else if(/^.kill\s*G1$/.test(message.content) && message.author.id === "333621078050078730"){
					joueurs.forEach((joueur) => {
						if(joueur.groupe === "G1"){
							joueur.groupe = "G3"
						}
					})
				}

				else if(/^.b[aâ]ton$/i.test(message.content) && map[joueurs[i].x][joueurs[i].y] === "Forêt"){
					joueurs[i].inventaire.push("Bâton")
					await message.channel.send("**:information_source: Tu ramasses 1 Bâton**")
					await ajoutXP(joueurs[i],message,1,XP_MAX)
					message.channel.send(infos(membre))
				}

				else if(/^.pierre$/i.test(message.content) && (map[joueurs[i].x][joueurs[i].y] === "Montagne" || map[joueurs[i].x][joueurs[i].y] === "Mine")){
					joueurs[i].inventaire.push("Pierre")
					await message.channel.send("**:information_source: Tu ramasses 1 Pierre**")
					await ajoutXP(joueurs[i],message,1,XP_MAX)
					message.channel.send(infos(membre))
				}

				else if(/^.herbe$/i.test(message.content) && map[joueurs[i].x][joueurs[i].y] === "Plaine"){
					joueurs[i].inventaire.push("Herbe fibreuse")
					await message.channel.send("**:information_source: Tu ramasses 1 Herbe fibreuse**")
					await ajoutXP(joueurs[i],message,1,XP_MAX)
					message.channel.send(infos(membre))
				}

				else if(/^.couper$/i.test(message.content) && quantitéObjet(joueurs[i].inventaire,"Hache") > 0 && map[joueurs[i].x][joueurs[i].y] === "Forêt"){
					if(joueurs[i].énergie < 2){
						message.channel.send("**:information_source: Tu n'as pas assez d'énergie, mange un truc ou attends un peu ! (+1/30s)**")
					}
					else{
						await message.channel.send("**:information_source: Tu récoltes 2 Bûche et 1 Sève**")
						joueurs[i].inventaire.push("Bûche")
						joueurs[i].inventaire.push("Bûche")
						joueurs[i].inventaire.push("Sève")
						joueurs[i].énergie-=2
						await ajoutXP(joueurs[i],message,5,XP_MAX)
						message.channel.send(infos(membre))
					}
				}

				else if(/^.miner$/i.test(message.content) && quantitéObjet(joueurs[i].inventaire,"Pioche") > 0 && map[joueurs[i].x][joueurs[i].y] === "Mine"){
					if(joueurs[i].énergie < 2){
						message.channel.send("**:information_source: Tu n'as pas assez d'énergie, mange un truc ou attends un peu ! (+1/30s)**")
					}
					else{
						const random = Math.random()*10
						if(random < 1){
							await message.channel.send("**:information_source: Tu récoltes 1 Diamant**")
							joueurs[i].inventaire.push("Diamant")
							joueurs[i].énergie-=2
							await ajoutXP(joueurs[i],message,20,XP_MAX)
							message.channel.send(infos(membre))
						}
						else if(random < 4){
							await message.channel.send("**:information_source: Tu récoltes 1 Or brut**")
							joueurs[i].inventaire.push("Or brut")
							joueurs[i].énergie-=2
							await ajoutXP(joueurs[i],message,9,XP_MAX)
							message.channel.send(infos(membre))
						}
						else{
							await message.channel.send("**:information_source: Tu récoltes 1 Fer brut**")
							joueurs[i].inventaire.push("Fer brut")
							joueurs[i].énergie-=2
							await ajoutXP(joueurs[i],message,6,XP_MAX)
							message.channel.send(infos(membre))
						}
					}
				}

				else if(/^.chasser$/i.test(message.content) && (map[joueurs[i].x][joueurs[i].y] === "Plaine" || map[joueurs[i].x][joueurs[i].y] === "Forêt")){
					if(joueurs[i].énergie < 2){
						message.channel.send("**:information_source: Tu n'as pas assez d'énergie, mange un truc ou attends un peu ! (+1/30s)**")
					}
					else{
						const random = Math.random()*20
						if(random < 3){
							await message.channel.send("**:information_source: Tu réussis à chasser un cheuvreuil ! En le dépeçant, tu obtiens 4 Cuir et 2 Viande de chevreuil crue**")
							joueurs[i].inventaire.push("Cuir")
							joueurs[i].inventaire.push("Cuir")
							joueurs[i].inventaire.push("Cuir")
							joueurs[i].inventaire.push("Cuir")
							joueurs[i].inventaire.push("Viande de chevreuil crue")
							joueurs[i].inventaire.push("Viande de chevreuil crue")
							joueurs[i].énergie-=2
							await ajoutXP(joueurs[i],message,20,XP_MAX)
							message.channel.send(infos(membre))
						}
						else if(random < 6){
							await message.channel.send("**:information_source: Tu récoltes 1 Myrtille**")
							joueurs[i].inventaire.push("Myrtille")
							joueurs[i].énergie-=2
							await ajoutXP(joueurs[i],message,7,XP_MAX)
							message.channel.send(infos(membre))
						}
						else if(random < 9){
							await message.channel.send("**:information_source: Tu récoltes 1 Plante médicinale**")
							joueurs[i].inventaire.push("Plante médicinale")
							joueurs[i].énergie-=2
							await ajoutXP(joueurs[i],message,9,XP_MAX)
							message.channel.send(infos(membre))
						}
						else if(random < 13){
							joueurs[i].vie-=vieEnlevée(joueurs[i],5)
							joueurs[i].énergie-=2
							if(joueurs[i].vie <= 0){
								message.channel.send(`**:skull: Tu tombes sur un ours bien plus fort que toi qui te tue, c'est ça de chasser sans être préparé :/**`)
								joueurs.splice(i,1)
							}
							else{
								await message.channel.send(`**:information_source: Tu tombes sur un ours bien plus fort que toi qui t'enlève ${vieEnlevée(joueurs[i],5)} :heart:**`)
								message.channel.send(infos(membre))
							}
						}
						else{
							await message.channel.send("**:information_source: Tu ne trouves malheureusement rien**")
							joueurs[i].énergie-=2
							message.channel.send(infos(membre))
						}
					}
				}

				else if(/^.force$/i.test(message.content) && joueurs[i].points > 0){
					joueurs[i].points--
					joueurs[i].force++
					await message.channel.send("**:information_source: 1 point ajouté dans la force !**")
					message.channel.send(infos(membre))
				}

				else if(/^.agilit[ée]$/i.test(message.content) && joueurs[i].points > 0){
					joueurs[i].points--
					joueurs[i].agilité++
					await message.channel.send("**:information_source: 1 point ajouté dans l'agilité !**")
					message.channel.send(infos(membre))
				}

				else if(/^.intelligence$/i.test(message.content) && joueurs[i].points > 0){
					joueurs[i].points--
					joueurs[i].intelligence++
					await message.channel.send("**:information_source: 1 point ajouté dans l'intelligence !**")
					message.channel.send(infos(membre))
				}

				else if(/^.[ée]quiper$/i.test(message.content)){
					let équipable = ""
					if(quantitéObjet(joueurs[i].inventaire,"Epée en fer") > 0){
						équipable += "*,équiper épée 1* : Equiper l'Epée en fer en Arme 1 | 5 :crossed_swords:\n"
						équipable += "*,équiper épée 2* : Equiper l'Epée en fer en Arme 2 | 5 :crossed_swords:\n"
					}
					if(quantitéObjet(joueurs[i].inventaire,"Hache") > 0){
						équipable += "*,équiper hache 1* : Equiper la Hache en Arme 1 | 3 :crossed_swords:\n"
						équipable += "*,équiper hache 2* : Equiper la Hache en Arme 2 | 3 :crossed_swords:\n"
					}
					if(quantitéObjet(joueurs[i].inventaire,"Pioche") > 0){
						équipable += "*,équiper pioche 1* : Equiper la Pioche en Arme 1 | 3 :crossed_swords:\n"
						équipable += "*,équiper pioche 2* : Equiper la Pioche en Arme 2 | 3 :crossed_swords:\n"
					}
					if(quantitéObjet(joueurs[i].inventaire,"Bâton") > 0){
						équipable += "*,équiper baton 1* : Equiper le Bâton en Arme 1 | 2 :crossed_swords:\n"
						équipable += "*,équiper baton 2* : Equiper le Bâton en Arme 2 | 2 :crossed_swords:\n"
					}
					if(quantitéObjet(joueurs[i].inventaire,"Rateau stratégique") > 0){
						équipable += "*,équiper rateau 1* : Equiper le Rateau stratégique en Arme 1 | 2 :crossed_swords:\n"
						équipable += "*,équiper rateau 2* : Equiper le Rateau stratégique en Arme 2 | 2 :crossed_swords:\n"
					}
					if(quantitéObjet(joueurs[i].inventaire,"Bouclier en bois") > 0){
						équipable += "*,équiper bouclier 1* : Equiper le Bouclier en bois en Arme 1 | 1 :shield:\n"
						équipable += "*,équiper bouclier 2* : Equiper le Bouclier en bois en Arme 2 | 1 :shield:\n"
					}
					if(quantitéObjet(joueurs[i].inventaire,"Casque de motard") > 0){
						équipable += "*,équiper motard* : Equiper le Jean à la Tête | 1 :shield:\n"
					}
					if(quantitéObjet(joueurs[i].inventaire,"Jean") > 0){
						équipable += "*,équiper jean* : Equiper le Jean aux Jambes | 1 :shield:\n"
					}
					if(quantitéObjet(joueurs[i].inventaire,"Paire de baskets") > 0){
						équipable += "*,équiper baskets* : Equiper la Paire de baskets aux Pieds | 1 :shield:\n"
					}
					if(équipable === ""){
						équipable = "*rien*"
					}
					const embed = new Discord.MessageEmbed()
					.setTitle("Objets équipables :")
					.setDescription(équipable)
					.setColor("#abf6a5")
					message.channel.send(embed)
				}

				else if(/^.[ée]quiper\s+[^\d]+\s*\d*$/i.test(message.content)){
					let objet = message.content.match(/(?<=^.[ée]quiper\s+)[^\d]+(?=\s*\d*$)/)[0].trim()
					let place = message.content.match(/(?<=^.[ée]quiper\s+[^\d]+\s*)\d+$/)
					if(place === null){
						place = 0
					}
					else{
						place = Number(place[0].trim())
					}
					if(/^épée$/i.test(objet) && quantitéObjet(joueurs[i].inventaire,"Epée en fer") > 0){
						if(place === 1){
							joueurs[i].arme1 = "Epée en fer"
							await message.channel.send("**:information_source: Epée en fer équipée en Arme 1 !**")
							message.channel.send(infos(membre))
						}
						else if(place === 2){
							joueurs[i].arme2 = "Epée en fer"
							await message.channel.send("**:information_source: Epée en fer équipée en Arme 2 !**")
							message.channel.send(infos(membre))
						}
						else{
							message.channel.send("**:information_source: Choisis un emplacement valide ! (,equiper X 1 ou ,equiper X 2)**")
						}
					}
					if(/^Hache$/i.test(objet) && quantitéObjet(joueurs[i].inventaire,"Hache") > 0){
						if(place === 1){
							joueurs[i].arme1 = "Hache"
							await message.channel.send("**:information_source: Hache équipée en Arme 1 !**")
							message.channel.send(infos(membre))
						}
						else if(place === 2){
							joueurs[i].arme2 = "Hache"
							await message.channel.send("**:information_source: Hache équipée en Arme 2 !**")
							message.channel.send(infos(membre))
						}
						else{
							message.channel.send("**:information_source: Choisis un emplacement valide ! (,equiper X 1 ou ,equiper X 2)**")
						}
					}
					if(/^Pioche$/i.test(objet) && quantitéObjet(joueurs[i].inventaire,"Pioche") > 0){
						if(place === 1){
							joueurs[i].arme1 = "Pioche"
							await message.channel.send("**:information_source: Pioche équipée en Arme 1 !**")
							message.channel.send(infos(membre))
						}
						else if(place === 2){
							joueurs[i].arme2 = "Pioche"
							await message.channel.send("**:information_source: Pioche équipée en Arme 2 !**")
							message.channel.send(infos(membre))
						}
						else{
							message.channel.send("**:information_source: Choisis un emplacement valide ! (,equiper X 1 ou ,equiper X 2)**")
						}
					}
					if(/^B[aâ]ton$/i.test(objet) && quantitéObjet(joueurs[i].inventaire,"Bâton") > 0){
						if(place === 1){
							joueurs[i].arme1 = "Bâton"
							await message.channel.send("**:information_source: Bâton équipé en Arme 1 !**")
							message.channel.send(infos(membre))
						}
						else if(place === 2){
							joueurs[i].arme2 = "Bâton"
							await message.channel.send("**:information_source: Bâton équipé en Arme 2 !**")
							message.channel.send(infos(membre))
						}
						else{
							message.channel.send("**:information_source: Choisis un emplacement valide ! (,equiper X 1 ou ,equiper X 2)**")
						}
					}
					if(/^rateau$/i.test(objet) && quantitéObjet(joueurs[i].inventaire,"Rateau stratégique") > 0){
						if(place === 1){
							joueurs[i].arme1 = "Rateau stratégique"
							await message.channel.send("**:information_source: Rateau stratégique équipé en Arme 1 !**")
							message.channel.send(infos(membre))
						}
						else if(place === 2){
							joueurs[i].arme2 = "Rateau stratégique"
							await message.channel.send("**:information_source: Rateau stratégique équipé en Arme 2 !**")
							message.channel.send(infos(membre))
						}
						else{
							message.channel.send("**:information_source: Choisis un emplacement valide ! (,equiper X 1 ou ,equiper X 2)**")
						}
					}
					if(/^bouclier$/i.test(objet) && quantitéObjet(joueurs[i].inventaire,"Bouclier en bois") > 0){
						if(place === 1){
							joueurs[i].arme1 = "Bouclier en bois"
							await message.channel.send("**:information_source: Bouclier équipé en Arme 1 !**")
							message.channel.send(infos(membre))
						}
						else if(place === 2){
							joueurs[i].arme2 = "Bouclier en bois"
							await message.channel.send("**:information_source: Bouclier équipé en Arme 2 !**")
							message.channel.send(infos(membre))
						}
						else{
							message.channel.send("**:information_source: Choisis un emplacement valide ! (,equiper X 1 ou ,equiper X 2)**")
						}
					}
					if(/^motard*$/i.test(objet) && quantitéObjet(joueurs[i].inventaire,"Casque de motard") > 0){
						joueurs[i].tête = "Casque de motard"
						await message.channel.send("**:information_source: Casque de motard équipé à la Tête !**")
						message.channel.send(infos(membre))
					}
					if(/^jean*$/i.test(objet) && quantitéObjet(joueurs[i].inventaire,"Jean") > 0){
						joueurs[i].pieds = "Jean"
						await message.channel.send("**:information_source: Jean équipé aux Jambes !**")
						message.channel.send(infos(membre))
					}
					if(/^baskets*$/i.test(objet) && quantitéObjet(joueurs[i].inventaire,"Paire de baskets") > 0){
						joueurs[i].pieds = "Paire de baskets"
						await message.channel.send("**:information_source: Paire de baskets équipée aux Pieds !**")
						message.channel.send(infos(membre))
					}
				}

				else if(/^.craft$/i.test(message.content)){
					let connus = ""

					if(joueurs[i].intelligence >= 0){
						connus += "1 **Corde** <= 3 Herbe fibreuse\n"
					}
					if(joueurs[i].intelligence >= 0){
						connus += "1 **Feu** <= 4 Bâton + 5 :zap:\n"
					}
					if(joueurs[i].intelligence >= 0){
						connus += "1 **Viande de chevreuil cuite** <= 1 Viande de chevreuil crue + *Feu*\n"
					}
					if(joueurs[i].intelligence >= 1){
						connus += "1 **Hache** <= 1 Pierre + 1 Bâton + 1 Corde\n"
					}
					if(joueurs[i].intelligence >= 1){
						connus += "1 **Pioche** <= 1 Pierre + 1 Bâton + 1 Corde\n"
					}
					if(joueurs[i].intelligence >= 1){
						connus += "1 **Pommade soignante naturelle** <= 1 Sève + 1 Plante médicinale + *Feu*\n"
					}
					if(joueurs[i].intelligence >= 1){
						connus += "1 **Bouclier en bois** <= 1 Bûche + 2 Bâton + 1 Corde\n"
					}
					if(joueurs[i].intelligence >= 1){
						connus += "1 **Barque** <= 4 Bûche + 2 Corde + 2 :zap:\n"
					}
					if(joueurs[i].intelligence >= 1){
						connus += "1 **Plastique** <= 1 Bouteille en plastique + *Feu*\n"
					}
					if(joueurs[i].intelligence >= 2){
						connus += "1 **Feu de compétition** <= 2 Bûche + *Feu*\n"
					}
					if(joueurs[i].intelligence >= 2){
						connus += "1 **Lingot de fer** <= 1 Fer brut + *Feu de compétition*\n"
					}
					if(joueurs[i].intelligence >= 2){
						connus += "1 **Lingot d'or** <= 1 Or brut + *Feu de compétition*\n"
					}
					if(joueurs[i].intelligence >= 2){
						connus += "1 **Epée en fer** <= 1 Lingot de fer + 1 Bâton + 1 Corde\n"
					}


					let craftable = ""



					if(joueurs[i].intelligence >= 0 && quantitéObjet(joueurs[i].inventaire,"Herbe fibreuse") >= 3){
						craftable += "*,craft corde* : Crafter une Corde | -3 Herbe fibreuse\n"
					}
					if(joueurs[i].intelligence >= 0 && quantitéObjet(joueurs[i].inventaire,"Bâton") >= 4 && joueurs[i].énergie >= 5){
						craftable += "*,craft feu* : Crafter un Feu | -4 Bâton, -5 :zap:\n"
					}
					if(joueurs[i].intelligence >= 0 && quantitéObjet(joueurs[i].inventaire,"Feu") >= 1 && quantitéObjet(joueurs[i].inventaire,"Viande de chevreuil crue") >= 1){
						craftable += "*,craft chevreuil* : Crafter une Viande de chevreuil cuite | -1 Viande de chevreuil crue | *Feu*\n"
					}
					if(joueurs[i].intelligence >= 1 && quantitéObjet(joueurs[i].inventaire,"Pierre") > 0 && quantitéObjet(joueurs[i].inventaire,"Bâton") > 0 && quantitéObjet(joueurs[i].inventaire,"Corde") > 0){
						craftable += "*,craft hache* : Crafter une Hache | -1 Pierre, -1 Bâton, -1 Corde\n"
					}
					if(joueurs[i].intelligence >= 1 && quantitéObjet(joueurs[i].inventaire,"Pierre") > 0 && quantitéObjet(joueurs[i].inventaire,"Bâton") > 0 && quantitéObjet(joueurs[i].inventaire,"Corde") > 0){
						craftable += "*,craft pioche* : Crafter une Pioche | -1 Pierre, -1 Bâton, -1 Corde\n"
					}
					if(joueurs[i].intelligence >= 1 && quantitéObjet(joueurs[i].inventaire,"Feu") >= 1 && quantitéObjet(joueurs[i].inventaire,"Sève") >= 1 && quantitéObjet(joueurs[i].inventaire,"Plante médicinale") >= 1){
						craftable += "*,craft pommade* : Crafter une Pommade soignante naturelle | -1 Sève, -1 Plante médicinale | *Feu*\n"
					}
					if(joueurs[i].intelligence >= 1 && quantitéObjet(joueurs[i].inventaire,"Bûche") >= 1 && quantitéObjet(joueurs[i].inventaire,"Corde") >= 1 && quantitéObjet(joueurs[i].inventaire,"Bâton") >= 2){
						craftable += "*,craft bouclier* : Crafter un Bouclier en bois | -1 Bûche, -2 Bâton, -1 Corde\n"
					}
					if(joueurs[i].intelligence >= 1 && quantitéObjet(joueurs[i].inventaire,"Bûche") >= 4 && quantitéObjet(joueurs[i].inventaire,"Corde") >= 2 && joueurs[i].énergie >= 2){
						craftable += "*,craft barque* : Crafter une Barque | -4 Bûche, -2 Corde, -2 :zap:\n"
					}
					if(joueurs[i].intelligence >= 1 && quantitéObjet(joueurs[i].inventaire,"Bouteille en plastique") >= 1 && quantitéObjet(joueurs[i].inventaire,"Feu") >= 1){
						craftable += "*,craft plastique* : Crafter un Plastique | -1 Bouteille en plastique | *Feu*\n"
					}
					if(joueurs[i].intelligence >= 2 && quantitéObjet(joueurs[i].inventaire,"Feu") >= 1 && quantitéObjet(joueurs[i].inventaire,"Bûche") >= 2){
						craftable += "*,craft feu de compet* : Crafter un Feu de compétition | -2 Bûche | *Feu*\n"
					}
					if(joueurs[i].intelligence >= 2 && quantitéObjet(joueurs[i].inventaire,"Fer brut") >= 1 && quantitéObjet(joueurs[i].inventaire,"Feu de compétition") >= 1){
						craftable += "*,craft fer* : Crafter un Lingot de fer | -1 Fer brut | *Feu de compétition*\n"
					}
					if(joueurs[i].intelligence >= 2 && quantitéObjet(joueurs[i].inventaire,"Or brut") >= 1 && quantitéObjet(joueurs[i].inventaire,"Feu de compétition") >= 1){
						craftable += "*,craft or* : Crafter un Lingot d'or | -1 Or brut | *Feu de compétition*\n"
					}
					if(joueurs[i].intelligence >= 2 && quantitéObjet(joueurs[i].inventaire,"Lingot de fer") >= 1 && quantitéObjet(joueurs[i].inventaire,"Bâton") >= 1 && quantitéObjet(joueurs[i].inventaire,"Corde") >= 1){
						craftable += "*,craft épée* : Crafter une Epée en fer | -1 Lingot de fer, -1 Bâton, -1 Corde\n"
					}

					if(craftable === ""){
						craftable+="*rien*"
					}
					const embed = new Discord.MessageEmbed()
					.setTitle("Crafts :")
					.addField("Crafts connus :",connus)
					.addField("Crafts faisables :",craftable)
					//.setDescription(`**Crafts connus :**\n${connus}\n**Crafts faisables** :\n${craftable}`)
					.setColor("#abf6a5")
					message.channel.send(embed)
				}

				else if(/^.craft\s+[^\d]+$/i.test(message.content)){
					let objet = message.content.match(/(?<=^.craft\s+)[^\d]+$/)[0].trim()
					if(/^hache$/i.test(objet) && quantitéObjet(joueurs[i].inventaire,"Pierre") > 0 && quantitéObjet(joueurs[i].inventaire,"Bâton") > 0 && quantitéObjet(joueurs[i].inventaire,"Corde") > 0 && joueurs[i].intelligence >= 1){
						joueurs[i].inventaire.push("Hache")
						supprimerObjet(joueurs[i],"Pierre",1)
						supprimerObjet(joueurs[i],"Bâton",1)
						supprimerObjet(joueurs[i],"Corde",1)
						await ajoutXP(joueurs[i],message,8,XP_MAX)
						await message.channel.send("**:information_source: Hache craftée !**")
						message.channel.send(infos(membre))
					}
					if(/^pioche$/i.test(objet) && quantitéObjet(joueurs[i].inventaire,"Pierre") > 0 && quantitéObjet(joueurs[i].inventaire,"Bâton") > 0 && quantitéObjet(joueurs[i].inventaire,"Corde") > 0 && joueurs[i].intelligence >= 1){
						joueurs[i].inventaire.push("Pioche")
						supprimerObjet(joueurs[i],"Pierre",1)
						supprimerObjet(joueurs[i],"Bâton",1)
						supprimerObjet(joueurs[i],"Corde",1)
						await ajoutXP(joueurs[i],message,8,XP_MAX)
						await message.channel.send("**:information_source: Pioche craftée !**")
						message.channel.send(infos(membre))
					}
					if(/^corde$/i.test(objet) && quantitéObjet(joueurs[i].inventaire,"Herbe fibreuse") >= 3 && joueurs[i].intelligence >= 1){
						joueurs[i].inventaire.push("Corde")
						supprimerObjet(joueurs[i],"Herbe fibreuse",3)
						await ajoutXP(joueurs[i],message,4,XP_MAX)
						await message.channel.send("**:information_source: Corde craftée !**")
						message.channel.send(infos(membre))
					}
					if(/^feu$/i.test(objet) && quantitéObjet(joueurs[i].inventaire,"Bâton") >= 4 && joueurs[i].intelligence >= 0 && joueurs[i].énergie >= 5){
						joueurs[i].énergie-=5
						joueurs[i].inventaire.push("Feu")
						supprimerObjet(joueurs[i],"Bâton",4)
						await ajoutXP(joueurs[i],message,5,XP_MAX)
						await message.channel.send("**:information_source: Feu crafté !**")
						message.channel.send(infos(membre))
					}
					if((/^feu de comp[ée]t$/i.test(objet) || /^feu de comp[ée]tition$/i.test(objet)) && quantitéObjet(joueurs[i].inventaire,"Feu") >= 1 && quantitéObjet(joueurs[i].inventaire,"Bûche") >= 2 && joueurs[i].intelligence >= 1){
						joueurs[i].inventaire.push("Feu de compétition")
						supprimerObjet(joueurs[i],"Bûche",2)
						await ajoutXP(joueurs[i],message,7,XP_MAX)
						await message.channel.send("**:information_source: Feu de compétition crafté !**")
						message.channel.send(infos(membre))
					}
					if(/^fer$/i.test(objet) && quantitéObjet(joueurs[i].inventaire,"Fer brut") >= 1 && quantitéObjet(joueurs[i].inventaire,"Feu de compétition") >= 1 && joueurs[i].intelligence >= 2){
						joueurs[i].inventaire.push("Lingot de fer")
						supprimerObjet(joueurs[i],"Fer brut",1)
						await ajoutXP(joueurs[i],message,10,XP_MAX)
						await message.channel.send("**:information_source: Lingot de fer crafté !**")
						message.channel.send(infos(membre))
					}
					if(/^or$/i.test(objet) && quantitéObjet(joueurs[i].inventaire,"Or brut") >= 1 && quantitéObjet(joueurs[i].inventaire,"Feu de compétition") >= 1 && joueurs[i].intelligence >= 2){
						joueurs[i].inventaire.push("Lingot d'or")
						supprimerObjet(joueurs[i],"Or brut",1)
						await ajoutXP(joueurs[i],message,10,XP_MAX)
						await message.channel.send("**:information_source: Lingot d'or crafté !**")
						message.channel.send(infos(membre))
					}
					if(/^pommade$/i.test(objet) && quantitéObjet(joueurs[i].inventaire,"Feu") >= 1 && quantitéObjet(joueurs[i].inventaire,"Sève") >= 1 && quantitéObjet(joueurs[i].inventaire,"Plante médicinale") >= 1 && joueurs[i].intelligence >= 1){
						joueurs[i].inventaire.push("Pommade soignante naturelle")
						supprimerObjet(joueurs[i],"Sève",1)
						supprimerObjet(joueurs[i],"Plante médicinale",1)
						await ajoutXP(joueurs[i],message,8,XP_MAX)
						await message.channel.send("**:information_source: Pommade soignante naturelle craftée !**")
						message.channel.send(infos(membre))
					}
					if(/^chevreuil$/i.test(objet) && quantitéObjet(joueurs[i].inventaire,"Feu") >= 1 && quantitéObjet(joueurs[i].inventaire,"Viande de chevreuil crue") >= 1 && joueurs[i].intelligence >= 0){
						joueurs[i].inventaire.push("Viande de chevreuil cuite")
						supprimerObjet(joueurs[i],"Viande de chevreuil crue",1)
						await ajoutXP(joueurs[i],message,6,XP_MAX)
						await message.channel.send("**:information_source: Viande de chevreuil cuite craftée !**")
						message.channel.send(infos(membre))
					}
					if(/^bouclier$/i.test(objet) && quantitéObjet(joueurs[i].inventaire,"Bûche") >= 1 && quantitéObjet(joueurs[i].inventaire,"Corde") >= 1 && quantitéObjet(joueurs[i].inventaire,"Bâton") >= 2 && joueurs[i].intelligence >= 1){
						joueurs[i].inventaire.push("Bouclier en bois")
						supprimerObjet(joueurs[i],"Bûche",1)
						supprimerObjet(joueurs[i],"Corde",1)
						supprimerObjet(joueurs[i],"Bâton",2)
						await ajoutXP(joueurs[i],message,8,XP_MAX)
						await message.channel.send("**:information_source: Bouclier en bois crafté !**")
						message.channel.send(infos(membre))
					}
					if(/^barque$/i.test(objet) && quantitéObjet(joueurs[i].inventaire,"Bûche") >= 4 && quantitéObjet(joueurs[i].inventaire,"Corde") >= 2 && joueurs[i].intelligence >= 1 && joueurs[i].énergie >= 2){
						joueurs[i].énergie-=2
						joueurs[i].inventaire.push("Barque")
						supprimerObjet(joueurs[i],"Bûche",4)
						supprimerObjet(joueurs[i],"Corde",2)
						await ajoutXP(joueurs[i],message,8,XP_MAX)
						await message.channel.send("**:information_source: Barque craftée !**")
						message.channel.send(infos(membre))
					}
					if(/^plastique$/i.test(objet) && quantitéObjet(joueurs[i].inventaire,"Bouteille en plastique") >= 1 && quantitéObjet(joueurs[i].inventaire,"Feu") >= 1 && joueurs[i].intelligence >= 1){
						joueurs[i].inventaire.push("Plastique")
						supprimerObjet(joueurs[i],"Bouteille en plastique",1)
						await ajoutXP(joueurs[i],message,6,XP_MAX)
						await message.channel.send("**:information_source: Plastique crafté !**")
						message.channel.send(infos(membre))
					}
					if(/^[ée]p[ée]e$/i.test(objet) && quantitéObjet(joueurs[i].inventaire,"Lingot de fer") > 0 && quantitéObjet(joueurs[i].inventaire,"Bâton") > 0 && quantitéObjet(joueurs[i].inventaire,"Corde") > 0 && joueurs[i].intelligence >= 2){
						joueurs[i].inventaire.push("Epée en fer")
						supprimerObjet(joueurs[i],"Lingot de fer",1)
						supprimerObjet(joueurs[i],"Bâton",1)
						supprimerObjet(joueurs[i],"Corde",1)
						await ajoutXP(joueurs[i],message,18,XP_MAX)
						await message.channel.send("**:information_source: Epée en fer craftée !**")
						message.channel.send(infos(membre))
					}
				}

				else if(/^.consommer$/i.test(message.content)){
					let consommable = ""
					if(quantitéObjet(joueurs[i].inventaire,"Myrtille") > 0){
						consommable += "*,consommer myrtille* : Manger une Myrtille | +3 :zap:, +1 :heart:\n"
					}
					if(quantitéObjet(joueurs[i].inventaire,"Barre chocolatée") > 0){
						consommable += "*,consommer barre* : Manger une Barre chocolatée | +5 :zap:\n"
					}
					if(quantitéObjet(joueurs[i].inventaire,"Saucisson") > 0){
						consommable += "*,consommer saucisson* : Manger un Saucisson | +6 :zap:, +1 :heart:\n"
					}
					if(quantitéObjet(joueurs[i].inventaire,"Baguette de pain") > 0){
						consommable += "*,consommer baguette* : Manger une Baguette de pain | +7 :zap:, +2 :heart:\n"
					}
					if(quantitéObjet(joueurs[i].inventaire,"Viande de chevreuil cuite") > 0){
						consommable += "*,consommer chevreuil* : Manger de la Viande de chevreuil cuite | +8 :zap:, +3 :heart:\n"
					}
					if(quantitéObjet(joueurs[i].inventaire,"Pommade soignante naturelle") > 0){
						consommable += "*,consommer pommade* : Appliquer de la Pommade soignante naturelle | +5 :heart:\n"
					}
					if(quantitéObjet(joueurs[i].inventaire,"Seringue médicale") > 0){
						consommable += "*,consommer seringue* : S'injecter la Seringue médicale | +7 :heart:\n"
					}
					if(consommable === ""){
						consommable = "*rien*"
					}
					const embed = new Discord.MessageEmbed()
					.setTitle("Objets consommables :")
					.setDescription(consommable)
					.setColor("#abf6a5")
					message.channel.send(embed)
				}

				else if(/^.consommer\s+[^\d]+$/i.test(message.content)){
					let objet = message.content.match(/(?<=^.consommer\s+)[^\d]+$/)[0].trim()
					if(/^myrtille$/i.test(objet) && quantitéObjet(joueurs[i].inventaire,"Myrtille") > 0){
						supprimerObjet(joueurs[i],"Myrtille",1)
						joueurs[i].énergie+=3
						joueurs[i].vie++
						await message.channel.send("**:information_source: Myrtille mangée !**")
						message.channel.send(infos(membre))
					}
					if(/^barre$/i.test(objet) && quantitéObjet(joueurs[i].inventaire,"Barre chocolatée") > 0){
						supprimerObjet(joueurs[i],"Barre chocolatée",1)
						joueurs[i].énergie+=5
						await message.channel.send("**:information_source: Barre chocolatée mangée !**")
						message.channel.send(infos(membre))
					}
					if(/^saucisson$/i.test(objet) && quantitéObjet(joueurs[i].inventaire,"Saucisson") > 0){
						supprimerObjet(joueurs[i],"Saucisson",1)
						joueurs[i].énergie+=6
						joueurs[i].vie+=1
						await message.channel.send("**:information_source: Saucisson mangé !**")
						message.channel.send(infos(membre))
					}
					if(/^baguette$/i.test(objet) && quantitéObjet(joueurs[i].inventaire,"Baguette de pain") > 0){
						supprimerObjet(joueurs[i],"Baguette de pain",1)
						joueurs[i].énergie+=7
						joueurs[i].vie+=2
						await message.channel.send("**:information_source: Baguette de pain mangée !**")
						message.channel.send(infos(membre))
					}
					if(/^chevreuil$/i.test(objet) && quantitéObjet(joueurs[i].inventaire,"Viande de chevreuil cuite") > 0){
						supprimerObjet(joueurs[i],"Viande de chevreuil cuite",1)
						joueurs[i].énergie+=8
						joueurs[i].vie+=3
						await message.channel.send("**:information_source: Viande de chevreuil cuite mangée !**")
						message.channel.send(infos(membre))
					}
					if(/^pommade$/i.test(objet) && quantitéObjet(joueurs[i].inventaire,"Pommade soignante naturelle") > 0){
						supprimerObjet(joueurs[i],"Pommade soignante naturelle",1)
						joueurs[i].vie+=5
						await message.channel.send("**:information_source: Pommade appliquée !**")
						message.channel.send(infos(membre))
					}
					if(/^seringue$/i.test(objet) && quantitéObjet(joueurs[i].inventaire,"Seringue médicale") > 0){
						supprimerObjet(joueurs[i],"Seringue médicale",1)
						joueurs[i].vie+=7
						await message.channel.send("**:information_source: Seringue médicale injectée !**")
						message.channel.send(infos(membre))
					}
					if(joueurs[i].vie > vieMaximum(joueurs[i])) joueurs[i].vie = vieMaximum(joueurs[i])
					if(joueurs[i].énergie > énergieMaximum(joueurs[i])) joueurs[i].énergie = énergieMaximum(joueurs[i])
				}

				else if(/^.fouiller$/i.test(message.content) && map[joueurs[i].x][joueurs[i].y] === "Ville"){
					if(joueurs[i].énergie < 1){
						message.channel.send("**:information_source: Tu n'as pas assez d'énergie, mange un truc ou attends un peu ! (+1/30s)**")
					}
					else{
						let random = Math.random()*100
						joueurs[i].énergie-=2
						if(random < 2){
							await message.channel.send("**:information_source: Tu trouves 1 Carte d'accès NASA**")
							joueurs[i].inventaire.push("Carte d'accès NASA")
							await ajoutXP(joueurs[i],message,2,XP_MAX)
							message.channel.send(infos(membre))
						}
						else if(random < 6){
							await message.channel.send("**:information_source: Tu trouves 1 Paire de baskets**")
							joueurs[i].inventaire.push("Paire de baskets")
							await ajoutXP(joueurs[i],message,2,XP_MAX)
							message.channel.send(infos(membre))
						}
						else if(random < 13){
							await message.channel.send("**:information_source: Tu trouves 1 Bouteille en plastique**")
							joueurs[i].inventaire.push("Bouteille en plastique")
							await ajoutXP(joueurs[i],message,2,XP_MAX)
							message.channel.send(infos(membre))
						}
						else if(random < 18){
							await message.channel.send("**:information_source: Tu trouves 1 Rateau stratégique**")
							joueurs[i].inventaire.push("Rateau stratégique")
							await ajoutXP(joueurs[i],message,2,XP_MAX)
							message.channel.send(infos(membre))
						}
						else if(random < 25){
							await message.channel.send("**:information_source: Tu trouves 1 Barre chocolatée**")
							joueurs[i].inventaire.push("Barre chocolatée")
							await ajoutXP(joueurs[i],message,2,XP_MAX)
							message.channel.send(infos(membre))
						}
						else if(random < 30){
							await message.channel.send("**:information_source: Tu trouves 1 Jean**")
							joueurs[i].inventaire.push("Jean")
							await ajoutXP(joueurs[i],message,2,XP_MAX)
							message.channel.send(infos(membre))
						}
						else if(random < 35){
							await message.channel.send("**:information_source: Tu trouves 1 Casque de motard**")
							joueurs[i].inventaire.push("Casque de motard")
							await ajoutXP(joueurs[i],message,2,XP_MAX)
							message.channel.send(infos(membre))
						}
						else if(random < 37){
							await message.channel.send("**:information_source: Tu trouves 1 Baguette de pain**")
							joueurs[i].inventaire.push("Baguette de pain")
							await ajoutXP(joueurs[i],message,2,XP_MAX)
							message.channel.send(infos(membre))
						}
						else if(random < 40){
							await message.channel.send("**:information_source: Tu trouves 1 Saucisson**")
							joueurs[i].inventaire.push("Saucisson")
							await ajoutXP(joueurs[i],message,2,XP_MAX)
							message.channel.send(infos(membre))
						}
						else if(random < 50){
							await message.channel.send("**:information_source: Tu trouves 2 Verre**")
							joueurs[i].inventaire.push("Verre")
							joueurs[i].inventaire.push("Verre")
							await ajoutXP(joueurs[i],message,2,XP_MAX)
							message.channel.send(infos(membre))
						}
						else if(random < 60){
							await message.channel.send("**:information_source: Tu trouves 1 Seringue médicale**")
							joueurs[i].inventaire.push("Seringue médicale")
							await ajoutXP(joueurs[i],message,2,XP_MAX)
							message.channel.send(infos(membre))
						}
						else{
							await message.channel.send("**:information_source: Tu ne trouves malheureusement rien**")
							message.channel.send(infos(membre))
						}
					}
				}

				let G1EnVie = 0
				let G2EnVie = 0
				let botChannel = serveur.channels.cache.get("768447286996762685")
				joueurs.forEach(joueur => {
					if(joueur.groupe === "G1") G1EnVie++
					if(joueur.groupe === "G2") G2EnVie++
				})
				if(G1EnVie === 0 && G2EnVie === 0){
					botChannel.send("@everyone **:information_source: LES GRANDS GAGNANTS DE LA BATAILLE SONT... ben personne en fait y'a égalité :p**")
					joueurs = []
					map = [[],[],[],[],[],[],[],[]]
					partieLancee = false
					bot.clearInterval(intervalle)
				}
				else if(G1EnVie === 0){
					botChannel.send("@everyone **:information_source: LES GRANDS GAGNANTS DE LA BATAILLE SONT... LES G2 !!!**")
					joueurs = []
					map = [[],[],[],[],[],[],[],[]]
					partieLancee = false
					bot.clearInterval(intervalle)
				}
				else if(G2EnVie === 0){
					botChannel.send("@everyone **:information_source: LES GRANDS GAGNANTS DE LA BATAILLE SONT... LES G1 !!!**")
					joueurs = []
					map = [[],[],[],[],[],[],[],[]]
					partieLancee = false
					bot.clearInterval(intervalle)
				}
			}
		}
	}
	
	if(Math.floor(Math.random()*20)+1 === 1){
		message.channel.send(anecdote[Math.floor(Math.random()*anecdote.length)])
	}
})
bot.on("messageReactionAdd", async (messageReaction, user) => {
	if(user.bot) return
})

bot.login("NzIwNjMzOTQzMTg3MTI4NDUy.XuI0qA.d1WHhX_bCIWD43SrfiiA9VXU_E0")//process.env.TOKEN