// --------------------------------------------------------------------------------------
// TOWER DEFENSE - Camille G., Arnault P. - 2015
// --------------------------------------------------------------------------------------
// CLASSE : JEU
// --------------------------------------------------------------------------------------
// Cette classe très générale représente un jeu complet de Tower Defense.
// Elle requiert le document HTML et le CSS associés, ainsi que les autres classes du jeu.
// 
// Cette classe contient les caractéristiques du jeu et de ses entités, une partie courante,
// un module graphique, ainsi qu'une gestion des meilleurs joueurs et de leurs scores.
// --------------------------------------------------------------------------------------

function Game ()
{
	// Partie courante
	this.current_game = null;

	// Objet contenant les différents "mondes" disponibles
	// Un monde doit être une fonction renvoyant une grille le décrivant (à améliorer !)
	this.worlds = {
		world1: function ()
		{
			// GRILLE PRINCIPALE : FORÊT
			grid = new Grid(10, 23);

			grid.cells[5][0].type  = CELL_ENTRANCE;
			grid.cells[2][22].type = CELL_EXIT;

			// Rocher 1
			grid.cells[2][7].type = CELL_BLOCK;
			grid.cells[2][8].type = CELL_BLOCK;
			grid.cells[2][9].type = CELL_BLOCK;
			grid.cells[2][10].type = CELL_BLOCK;
			grid.cells[2][11].type = CELL_BLOCK;

			grid.cells[3][7].type = CELL_BLOCK;
			grid.cells[3][9].type = CELL_BLOCK;
			grid.cells[3][10].type = CELL_BLOCK;

			grid.cells[4][7].type = CELL_BLOCK;
			grid.cells[4][8].type = CELL_BLOCK;
			grid.cells[4][9].type = CELL_BLOCK;

			// Rocher 2
			grid.cells[9][11].type = CELL_BLOCK;
			grid.cells[9][13].type = CELL_BLOCK;
			grid.cells[9][14].type = CELL_BLOCK;

			grid.cells[8][11].type = CELL_BLOCK;
			grid.cells[8][13].type = CELL_BLOCK;

			grid.cells[7][12].type = CELL_BLOCK;

			// Eau
			grid.cells[0][15].type = CELL_BLOCK;
			grid.cells[2][15].type = CELL_BLOCK;

			grid.cells[4][15].type = CELL_BLOCK;
			grid.cells[5][15].type = CELL_BLOCK;
			grid.cells[4][16].type = CELL_BLOCK;
			grid.cells[5][16].type = CELL_BLOCK;
			grid.cells[4][17].type = CELL_BLOCK;
			grid.cells[5][17].type = CELL_BLOCK;
			grid.cells[4][18].type = CELL_BLOCK;
			grid.cells[5][18].type = CELL_BLOCK;

			grid.cells[4][19].type = CELL_BLOCK;
			grid.cells[4][20].type = CELL_BLOCK;
			grid.cells[5][20].type = CELL_BLOCK;
			grid.cells[6][18].type = CELL_BLOCK;
			grid.cells[6][20].type = CELL_BLOCK;
			grid.cells[7][18].type = CELL_BLOCK;
			grid.cells[7][20].type = CELL_BLOCK;

			grid.cells[7][18].type = CELL_BLOCK;
			grid.cells[7][19].type = CELL_BLOCK;
			grid.cells[7][20].type = CELL_BLOCK;

			grid.cells[9][18].type = CELL_BLOCK;
			grid.cells[9][19].type = CELL_BLOCK;
			grid.cells[9][20].type = CELL_BLOCK;

			grid.updateEntranceAndExit();
			grid.updateDistancesToExit();

			return grid;
		}
	}

	// Objet décrivant les caractéristiques de tous les ennemis du jeu
	this.enemies_characteristics = {
		
		soldier1: {
			hp: 15,
			speed: 1.5,
			reward: 15
		},

		soldier2: {
			hp: 15,
			speed: 3,
			reward: 20
		},

		soldier3: {
			hp: 60,
			speed: 1,
			reward: 30
		},

		soldier4: {
			hp: 8000,
			speed: 0.3,
			reward: 350
		}
	};
	this.towers_characteristics = {
		tower1: {
			nb_levels: 3,

			level1: {
				type: "damages",
				price: 80,
				value: 40,
				strength: 8,
				speed: 0.60,
				name: "Canon simple",
				description: "Description de la tour n°1",
				range: 2
			},

			level2: {
				type: "damages",
				price: 220,
				value: 150,
				strength: 12,
				speed: 0.80,
				name: "Canon amélioré",
				description: "Description de la tour n°1",
				range: 2
			},

			level3: {
				type: "damages",
				price: 450,
				value: 375,
				strength: 25,
				speed: 1.2,
				name: "Super canon",
				description: "Description de la tour n°1",
				range: 3
			}
		},

		tower2: {
			nb_levels: 3,

			level1: {
				type: "slow",
				price: 100,
				value: 50,
				strength: 1.5,
				speed: 0.75,
				name: "Ralentisseur simple",
				description: "Description de la tour n°2",
				range: 1
			},

			level2: {
				type: "slow",
				price: 250,
				value: 175,
				strength: 2,
				speed: 1,
				name: "Ralentisseur amélioré",
				description: "Description de la tour n°2",
				range: 2
			},

			level3: {
				type: "slow",
				price: 500,
				value: 425,
				strength: 2,
				speed: 1.50,
				name: "Super ralentisseur",
				description: "Description de la tour n°2",
				range: 3
			}
		}
	};
	this.levels_characteristics = {
		nb_levels: 25,

		level1: {
			0: {
				0:  "soldier1",
				4000: "soldier1"
			}
		},

		level2: {
			0: {
				0:  "soldier1",
				4000: "soldier1",
				8000: "soldier1"
			}
		},

		level3: {
			0: {
				0:  "soldier1",
				1500: "soldier1",
				2500: "soldier1"
			}
		},

		level4: {
			0: {
				0:  "soldier2",
				1500: "soldier2",
				2500: "soldier1",
				3100: "soldier1"
			}
		},

		level5: {
			0: {
				0:  "soldier2",
				500: "soldier2",
				1200: "soldier2"
			}
			
		},

		level6: {
			0: {
				0:  "soldier2",
				500: "soldier3",
				1200: "soldier2",
				1250 : "soldier1"
			}
		},

		level7: {
			0: {
				0:  "soldier1",
				100:  "soldier3",
				500: "soldier3"
			},
		},

		level8: {
			0: {
				200: "soldier1",
				400: "soldier1",
				600: "soldier1",
				2000: "soldier2",
				2200: "soldier2",
				2800: "soldier2"
			}
		},

		level9: {
			0: {
				200: "soldier1",
				400: "soldier2",
				600: "soldier1",
				1600: "soldier2",
				1800: "soldier1",
				3000: "soldier3"
			}
		},

		level10: {
			0: {
				200: "soldier1",
				400: "soldier2",
				600: "soldier1",
				1600: "soldier2",
				1800: "soldier1"
			},

			4500:{

				0:  "soldier2",
				400: "soldier2",
				1000: "soldier2",
				1050: "soldier2"
			}
		},

		level11: {
			0: {
				200: "soldier1",
				400: "soldier1",
				600: "soldier1",
				1600: "soldier1",
				1800: "soldier1"
			},

			4500:{

				0:  "soldier3",
				1000: "soldier3",
				1250: "soldier3"
			}
		},

		level12: {
			0: {
				200: "soldier1",
				400: "soldier1",
				600: "soldier3",
				1600: "soldier1",
				1800: "soldier1"
			},

			4500:{

				0:  "soldier3",
				1000: "soldier2",
				1250: "soldier3"
			}
		},

		level13: {
			0: {
				200: "soldier1",
				400: "soldier1",
				600: "soldier3",
				1600: "soldier1",
				1800: "soldier3"
			},

			4500:{

				0:  "soldier3",
				1000: "soldier2",
				1250: "soldier3",
			},

			6500:{

				0:  "soldier1",
				300: "soldier1",
				600: "soldier3",
				900: "soldier1",
				1200: "soldier3",
				1250: "soldier1"
			}
		},

		level14: {
			0: {
				200: "soldier1",
				400: "soldier1",
				600: "soldier3",
				1600: "soldier1",
				1800: "soldier3"
			},

			4500:{

				0:  "soldier3",
				1000: "soldier2",
				1250: "soldier3",
			},

			6500:{

				0:  "soldier1",
				300: "soldier3",
				600: "soldier1",
				900: "soldier1",
				1200: "soldier1",
				1400: "soldier3",
				1810: "soldier3",
				1900: "soldier3",
				2000: "soldier3"
			}
		},

		level15: {
			0: {

				200: "soldier3",
				600: "soldier3",
				1000: "soldier3",
				1400: "soldier3",
				1800: "soldier3",
				210: "soldier3",
				610: "soldier3",
				1010: "soldier3",
				1410: "soldier3",
				1810: "soldier3",
				1900: "soldier3",
				2000: "soldier3",
				2100: "soldier3",
				2200: "soldier3"
			}
		},

		level16: {
			0:{

				0: "soldier3",
				150: "soldier3",
				300: "soldier3",
				450: "soldier3",
				500: "soldier3",
				650: "soldier3",
				800: "soldier3",
				950: "soldier3",
				1100: "soldier3",
				1500: "soldier3",
				1810: "soldier3",
				1900: "soldier3",
				2000: "soldier3",
				2100: "soldier3",
				2200: "soldier2"
			}
		},

		level17: {
			0:{

				0: "soldier1",
				150: "soldier1",
				300: "soldier1",
				450: "soldier1",
				600: "soldier1",
				750: "soldier1",
				900: "soldier1",
				1050: "soldier1",
				1200: "soldier1",
				1350: "soldier1",
				1500: "soldier1",
				1650: "soldier1",
				1800: "soldier1",
				1950: "soldier1",
				1100: "soldier1",
				1250: "soldier1",
				1500: "soldier1",
				1650: "soldier1",
				1800: "soldier1",
				1950: "soldier1",
				2100: "soldier1",
				2250: "soldier1",
				2400: "soldier1",
				2550: "soldier1",
				2700: "soldier2"
			}
		},

		level18: {
			0:{

				 0: "soldier2",
				150: "soldier2",
				300: "soldier2",
				450: "soldier2",
				600: "soldier2",
				750: "soldier2",
				900: "soldier2",
				1050: "soldier2",
				1200: "soldier2",
				1350: "soldier2",
				1500: "soldier2",
				1650: "soldier2",
				1800: "soldier2",
				1950: "soldier2",
				1100: "soldier2",
				1250: "soldier2",
				1500: "soldier2",
				1650: "soldier2",
				1800: "soldier2",
				1950: "soldier2",
				2100: "soldier2",
				2250: "soldier2",
				2400: "soldier2",
				2550: "soldier2",
				2700: "soldier2",
				2850: "soldier2",
				3000: "soldier2",
				3150: "soldier2",
			
			}
		},

		level19: {
			0:{

				0: "soldier3",
				150: "soldier3",
				300: "soldier3",
				450: "soldier3",
				600: "soldier3",
				750: "soldier3",
				900: "soldier3",
				1050: "soldier3",
				1200: "soldier3",
				1350: "soldier3",
				1500: "soldier3",
				1650: "soldier3",
				1800: "soldier3",
				1900: "soldier3",
				2150: "soldier3",
				2300: "soldier3",
			
			}
		},

		level20: {
			0:{

				0: "soldier4"
			}
		},

		level21: {
			0:{

				0: "soldier2",
				150: "soldier2",
				300: "soldier2",
				450: "soldier2",
				600: "soldier2",
				750: "soldier2",
				900: "soldier2",
				1050: "soldier2",
				1200: "soldier2",
				1350: "soldier2",
				1500: "soldier2",
				1650: "soldier2",
				1800: "soldier2",
				1950: "soldier2",
				1100: "soldier2",
				1250: "soldier2",
				1500: "soldier2",
				1650: "soldier2",
				1800: "soldier2",
				1950: "soldier2",
				2100: "soldier2",
				2250: "soldier2",
				2400: "soldier2",
				2550: "soldier2",
				2700: "soldier2",
				2850: "soldier2",
				3000: "soldier2",
				3150: "soldier2",
				3300: "soldier2",
				3450: "soldier2",
				3600: "soldier2",
				3750: "soldier2",
				3900: "soldier2",
				4500: "soldier2",
				4750: "soldier2",
				4900: "soldier2",
				5050: "soldier2",
				6200: "soldier2",
				6350: "soldier2",
				6500: "soldier2",
				6650: "soldier2",
				6800: "soldier2",
				6950: "soldier2",
				7100: "soldier2",
				7250: "soldier2",
				7500: "soldier2",
				7650: "soldier2",
				7800: "soldier2",
				7950: "soldier2",
				8100: "soldier2",
				8250: "soldier2",
				8350: "soldier2",
				8550: "soldier2",
				8700: "soldier2",
				8850: "soldier2",
				9000: "soldier2",
				9150: "soldier2",
				9300: "soldier2",
				9450: "soldier2",
				9600: "soldier2",
				9750: "soldier2",
				9900: "soldier2"
			}
		},

		level22: {
			0:{

				0: "soldier3",
				150: "soldier3",
				300: "soldier3",
				450: "soldier3",
				600: "soldier3",
				750: "soldier3",
				900: "soldier3",
				1050: "soldier3",
				1200: "soldier3",
				1350: "soldier3",
				1500: "soldier3",
				1650: "soldier3",
				1800: "soldier3",
				1950: "soldier3",
				1100: "soldier3",
				1250: "soldier3",
				1500: "soldier3",
				1650: "soldier3",
				1800: "soldier3",
				1950: "soldier3",
				2100: "soldier3",
				2250: "soldier3",
				2400: "soldier3",
				2550: "soldier3",
				2700: "soldier3",
				2850: "soldier3",
				3000: "soldier3",
				3150: "soldier3",
				3300: "soldier3",
				3450: "soldier3",
				3600: "soldier3",
				3750: "soldier3",
				3900: "soldier3",
				4500: "soldier3",
				4750: "soldier3",
				4900: "soldier3",
				5050: "soldier3",
				6200: "soldier3",
				6350: "soldier3",
				6500: "soldier3",
				6650: "soldier3",
				6800: "soldier3",
				6950: "soldier3",
				7100: "soldier3",
				7250: "soldier3",
				7500: "soldier3",
				7650: "soldier3",
				7800: "soldier3",
				7950: "soldier3"
			}
		},

		level23: {
			0:{

				0: "soldier3",
				150: "soldier3",
				300: "soldier3",
				450: "soldier3",
				600: "soldier3",
				750: "soldier3",
				900: "soldier3",
				1050: "soldier3",
				1200: "soldier3",
				1350: "soldier3",
				1500: "soldier3",
				1650: "soldier3",
				1800: "soldier3",
				1950: "soldier3",
				1100: "soldier3",
				1250: "soldier3",
				1500: "soldier3",
				1650: "soldier3",
				1800: "soldier3",
				1950: "soldier3",
				2100: "soldier1",
				2250: "soldier1",
				2400: "soldier1",
				2550: "soldier1",
				2700: "soldier1",
				2850: "soldier1",
				3000: "soldier1",
				3100: "soldier4",
				3150: "soldier1",
				3300: "soldier1",
				3450: "soldier1",
				3600: "soldier1",
				3750: "soldier1",
				3900: "soldier1",
				4500: "soldier1",
				4750: "soldier1",
				4900: "soldier1",
				5050: "soldier1",
				6200: "soldier1",
				6350: "soldier2",
				6500: "soldier2",
				6650: "soldier2",
				6800: "soldier2",
				6950: "soldier2",
				7100: "soldier2",
				7250: "soldier2",
				7500: "soldier2",
				7650: "soldier2",
				7800: "soldier2",
				7950: "soldier2",
				8100: "soldier2",
				8250: "soldier2",
				8350: "soldier2",
				8550: "soldier2",
				8700: "soldier2",
				8850: "soldier2",
				9000: "soldier2",
				9150: "soldier2",
				9300: "soldier2",
				9450: "soldier2",
				9600: "soldier2",
				9750: "soldier2",
				9900: "soldier2"
			}
		},

		level24: {
			0:{

				0: "soldier3",
				150: "soldier3",
				300: "soldier3",
				450: "soldier3",
				600: "soldier3",
				750: "soldier3",
				900: "soldier3",
				1050: "soldier3",
				1200: "soldier3",
				1350: "soldier3",
				1500: "soldier3",
				1650: "soldier3",
				1800: "soldier3",
				1950: "soldier3",
				1100: "soldier3",
				1250: "soldier3",
				1500: "soldier3",
				1650: "soldier3",
				1800: "soldier3",
				1950: "soldier3",
				2100: "soldier3",
				2250: "soldier3",
				2400: "soldier3",
				2550: "soldier3",
				2700: "soldier3",
				2850: "soldier3",
				3000: "soldier3",
				3100: "soldier4",
				3150: "soldier3",
				3300: "soldier3",
				3450: "soldier3",
				3600: "soldier3",
				3750: "soldier3",
				3900: "soldier3",
				4500: "soldier3",
				4750: "soldier3",
				4900: "soldier3",
				5050: "soldier3",
				6200: "soldier3",
				6350: "soldier3",
				6500: "soldier3",
				6650: "soldier3",
				6800: "soldier3",
				6950: "soldier3",
				7100: "soldier3",
				7250: "soldier3",
				7500: "soldier3",
				7650: "soldier3",
				7800: "soldier3",
				7950: "soldier3",
				8100: "soldier3",
				8250: "soldier3",
				8350: "soldier3",
				8550: "soldier3",
				8700: "soldier3",
				8850: "soldier3",
				9000: "soldier3",
				9150: "soldier3",
				9300: "soldier3",
				9450: "soldier3",
				9600: "soldier3",
				9750: "soldier3",
				9900: "soldier3"
			}
		},

		level25: {
			0: {
				0:  "soldier4",
				10000: "soldier4",
				15000: "soldier4"
			},

			5000: {
				 0: "soldier2",
				150: "soldier2",
				300: "soldier2",
				450: "soldier2",
				600: "soldier2",
				750: "soldier2",
				900: "soldier2",
				1050: "soldier2",
				1200: "soldier2"
			},

			12500: {
				 0: "soldier2",
				150: "soldier2",
				300: "soldier2",
				450: "soldier2",
				600: "soldier2",
				750: "soldier2",
				900: "soldier2",
				1050: "soldier2",
				1200: "soldier2"
			},

			18000: {
				 0: "soldier2",
				150: "soldier2",
				300: "soldier2",
				450: "soldier2",
				600: "soldier2",
				750: "soldier2",
				900: "soldier2",
				1050: "soldier2",
				1200: "soldier2"
			}
		},


	};
	// Module graphique, permettant l'affichage du jeu courant
	this.graphics = new Graphics();

	// --------------------------------------------------------------------------------------
	// GESTION DES MEILLEURS JOUEURS (+ ENREGISTREMENT/CHARGEMENT)
	// --------------------------------------------------------------------------------------

	this.best_players = {
		max_best_players: 5,
		nb_best_players : 0,

		nicknames: [],
		levels   : []
	};

	this.loadBestPlayers = function ()
	{
		// S'il n'y a aucun meilleurs joueurs sauvegardés, on ne fait rien
		var saved_best_players = JSON.parse(localStorage.getItem("best_players"));
		if (! saved_best_players) return;

		console.log("Meilleurs joueurs chargés");
		this.best_players = saved_best_players;
	};

	// Au lancement du jeu, si des meilleurs joueurs sont sauvegardés, on les récupères
	this.loadBestPlayers();

	this.saveBestPlayers = function ()
	{
		console.log("Meilleurs joueurs sauvegardés");
		localStorage.setItem("best_players", JSON.stringify(this.best_players));
	};

	this.thereIsAFreeBestPlayerSlot = function ()
	{
		return this.best_players.nb_best_players < this.best_players.max_best_players;
	};

	this.scoreIsSufficient = function ()
	{
		// S'il reste au moins une place de libre, le score convient toujours
		if (this.thereIsAFreeBestPlayerSlot()) return true;

		// Sinon, on vérifie que le niveau courant est supérieur ou égal à celui du dernier meilleur joueur
		return this.best_players.levels[this.best_players.max_best_players - 1] <= this.current_game.level;
	};

	this.addBestPlayer = function (nickname)
	{
		// On vérifie que le score suffit
		if (! this.scoreIsSufficient())
		{
			console.log("Impossible d'ajouter un meilleur joueur : score insuffisant !");
			return;
		}

		// Fonction locale permettant d'insérer un élément dans un tableau, à un indice donné
		function insertElementInArray (array, element, index)
		{
			var first_part_of_array  = array.slice(0, index);
			var second_part_of_array = array.slice(index);

			return first_part_of_array.concat(element).concat(second_part_of_array);
		}

		// On parcourt le tableau des niveaux atteints par les meilleurs joueurs pour trouver où ajouter le nouveau meilleur joueur
		var player_has_been_added = false;
		for (var index in this.best_players.levels)
		{
			var current_best_player_level = this.best_players.levels[index];
			if (current_best_player_level > this.current_game.level) continue;

			// Si on trouve où ajouter le joueur, on insère les infos dans les tableaux à l'indice courant
			this.best_players.nicknames = insertElementInArray(this.best_players.nicknames, nickname, index);
			this.best_players.levels    = insertElementInArray(this.best_players.levels, this.current_game.level, index);
		
			player_has_been_added = true;
			break;
		}

		// Si on n'a pas pu insérer le joueur, on l'ajoute à la fin du tableau
		if (! player_has_been_added)
		{
			var new_best_player_index = this.best_players.nb_best_players;

			this.best_players.nicknames[new_best_player_index] = nickname;
			this.best_players.levels[new_best_player_index]	= this.current_game.level;
		}

		// On prend en compte l'ajout d'un joueur ; si on excède le nombre maximum de meilleurs joueurs, on sort le dernier du tableau
		this.best_players.nb_best_players++;

		if (this.best_players.nb_best_players > this.best_players.max_best_players)
		{
			console.log("Pop !");
			this.best_players.nicknames.pop();
			this.best_players.levels.pop();
		}

		// On sauvegarde finalement les meilleurs joueurs
		this.saveBestPlayers();
	};

	// --------------------------------------------------------------------------------------
	// LANCEMENT D'UNE PARTIE
	// --------------------------------------------------------------------------------------

	// Cette fonction initialise l'objet Game, initialise, et lance une partie
	this.play = function (world)
	{
		// On crée une nouvelle partie
		this.current_game = new CurrentGame(this.worlds[world](), world);
		
		// On lance la partie et la boucle d'évènements relatifs au jeu
		this.current_game.startGame(this.levels_characteristics);
		this.current_game.updateGame();

		// On initialise le module graphique
		this.graphics.initMouseEvents(this.current_game, this.towers_characteristics);
		this.graphics.initBuyTowerPopup(this.current_game, this.towers_characteristics);

		// On démarre l'affichage graphique
		this.graphics.draw(this);
	};
}

// Lorsque la page est chargée, on crée un nouveau jeu et lance une partie
$(document).ready(function() {
	var game = new Game();
	game.play("world1");

	console.log(game);
});
