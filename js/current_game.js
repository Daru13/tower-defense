// --------------------------------------------------------------------------------------
// TOWER DEFENSE - Camille G., Arnault P. - 2015
// --------------------------------------------------------------------------------------
// CLASSE : PARTIE COURANTE
// --------------------------------------------------------------------------------------
// Cette classe représente une partie de Tower Defense.
//
// Elle permet une gestion complète du jeu en cours, indépendemment de l'affichage graphique.
// Elle permet de manipuler l'état du jeu, les ennemis et les tours.
// --------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------
// DEFINITION DE CONSTANTES (Etats de la partie courante)
// --------------------------------------------------------------------------------------

STATE_NOT_STARTED = 0;
STATE_BUILDING	  = 5;
STATE_ATTACK	  = 10;
STATE_PAUSE 	  = 15;
STATE_SUCCESS 	  = 20;
STATE_GAME_OVER	  = 25;

function CurrentGame (grid, world)
{
	// Grille de jeu
	this.grid = grid;

	// Etat du jeu
	this.game_state = STATE_NOT_STARTED;

	// File d'ennemis (ordonnée) et tableau de tours
	this.towers  = [];
	this.enemies = [];

	// Monde, niveau et niveau maximum de cette partie
	this.world 							 = world;
	this.level 	 	  					 = 1;
	this.last_level						 = undefined;

	// Argent du joueur
	this.player_money = 100;

	// Divers compteurs relatifs aux ennemis
	this.current_level_nb_enemies 		 = 0;
	this.current_level_nb_passed_enemies = 0;
	this.current_level_nb_killed_enemies = 0;

	this.nb_passed_enemies  = 0;
	this.nb_allowed_enemies = 9;

	// --------------------------------------------------------------------------------------
	// GESTION DES MODES DE JEU
	// --------------------------------------------------------------------------------------

	// Fonction à appeler à chaque lancement de niveau
	this.startBuilding = function ()
	{
		console.log("Passage en mode CONSTRUCTION");

		// On passe en mode construction
		this.game_state = STATE_BUILDING;
	};

	this.startAttack = function (levels_characteristics, enemies_characteristics)
	{
		console.log("Passage en mode ATTAQUE");

		// On programme l'ajout des ennemis du niveau
		this.loadEnemies(levels_characteristics, enemies_characteristics);

		// On passe en mode attaque
		this.game_state = STATE_ATTACK;
	}

	this.levelIsDone = function ()
	{
		// En cas de Game Over, un niveau n'est jamais terminé
		if (this.game_state === STATE_GAME_OVER) return false;

		return this.current_level_nb_enemies === (this.current_level_nb_killed_enemies + this.current_level_nb_passed_enemies);
	};

	this.goToNextLevel = function ()
	{
		// Cas où le dernier niveau est atteint
		if (this.level === this.last_level)
		{
			console.log("Dernier niveau terminé !");
			this.game_state = STATE_SUCCESS;
			return;
		}

		console.log("Ennemis passés : " + this.current_level_nb_passed_enemies);
		console.log("Ennemis tués : " + this.current_level_nb_killed_enemies);
		console.log("Ennemis du niv : " + this.current_level_nb_enemies);

		// On passe au niveau suivant et met à jour les compteurs d'ennemis max/tués
		// Le nombre d'ennemis du niveau est fixé au lancement de l'attaque
		this.current_level_nb_killed_enemies = 0;
		this.current_level_nb_passed_enemies = 0;
		this.level++;

		// On passe en mode construction
		this.startBuilding();
	};

	this.gameIsEnded = function ()
	{
		return this.game_state === STATE_SUCCESS
			|| this.game_state === STATE_GAME_OVER;
	}

	this.updateState = function ()
	{
		// On ignore la mise à jour de l'état du jeu dans certains modes
		if (this.game_state === STATE_NOT_STARTED
		||  this.game_state === STATE_BUILDING
		||  this.gameIsEnded()) return;

		// Si plus d'ennemis sont passés que le nombre autorisé, on passe en mode game over
		if (this.nb_passed_enemies > this.nb_allowed_enemies)
			this.game_state = STATE_GAME_OVER;

		// Si le niveau est terminé, on passe au suivant
		if (this.levelIsDone())
			this.goToNextLevel();
	};

	// --------------------------------------------------------------------------------------
	// LANCEMENT ET RELANCEMENT D'UNE PARTIE
	// --------------------------------------------------------------------------------------

	this.startGame = function (levels_characteristics)
	{
		console.log("--- LANCEMENT DU JEU ---");

		// On lance le jeu au niveau 1 et fixe le niveau maximum
		this.level 		= 1;
		this.last_level = levels_characteristics.nb_levels;

		this.startBuilding();
	};

	this.restartGame = function (levels_characteristics)
	{
		console.log("--- RE-LANCEMENT DU JEU ---");

		// On supprime toutes les tours en remplacant leurs cellulles par des cellulles vides
		for (var index = 0 ; index < this.towers.length; index++ ){
			var tower  = this.towers[index];
			this.grid.cells[tower.row][tower.col] = new Cell(tower.row, tower.col, CELL_EMPTY);
		}

		// on vide le tableau des tours
		this.towers  = [];
		// idem pour les enemies
		this.enemies = [];

		// On remet à zéro diverses variables
		this.level 	 	  					 = 1;
		this.current_level_nb_enemies 		 = 0;
		this.current_level_nb_passed_enemies = 0;
		this.current_level_nb_killed_enemies = 0;
		this.player_money 					 = 500;
		this.nb_passed_enemies 				 = 0;

		// On recalcule aussi la matrice des distances jusqu'à la sortie
		this.grid.updateDistancesToExit();

		// Le jeu est alors prêt à être relancé
		this.startBuilding();
	}

	// --------------------------------------------------------------------------------------
	// GESTION DES ENNEMIS
	// --------------------------------------------------------------------------------------

	this.loadEnemy = function (enemy_type, delay, enemies_characteristics)
	{
		var this_current_game = this;
		setTimeout(function () {
					console.log("Ajout ennemi (" + enemy_type + ") à " + delay);
					var added_enemy = this_current_game.addEnemy(enemy_type, enemies_characteristics);
					added_enemy.move(this_current_game.grid);
				}, delay);
	}

	this.loadEnemies = function (levels_characteristics, enemies_characteristics)
	{
		// On compte le nombre d'ennemis du niveau
		var level_nb_enemies = 0;

		// On parcourt toutes les vagues d'ennemis du niveau
		for (var current_wave_index in levels_characteristics["level" + this.level])
		{
			var current_wave 	   = levels_characteristics["level" + this.level][current_wave_index];
			var current_wave_delay = current_wave_index;

			// On programme l'ajout d'ennemis pour chaque vague
			for (var current_addition_index in current_wave)
			{
				var current_addition_delay 		= current_addition_index;
				var current_addition_enemy_type = current_wave[current_addition_index];

				this.loadEnemy(current_addition_enemy_type, parseInt(current_wave_delay) + parseInt(current_addition_delay), enemies_characteristics);
				level_nb_enemies++;
			}
		}

		this.current_level_nb_enemies = level_nb_enemies;
	};

	this.addEnemy = function (enemy_type, enemies_characteristics)
	{
		var new_enemy = new Enemy(this.grid.entrance.row, this.grid.entrance.col, enemy_type, enemies_characteristics);
		this.enemies.push(new_enemy);

		return new_enemy;
	};

	// --------------------------------------------------------------------------------------
	// GESTION DES TOURS
	// --------------------------------------------------------------------------------------

	this.addTower = function (row, col, tower_type, towers_characteristics)
	{
		// On vérifie que la cellule soit bien libre
		if (this.grid.cells[row][col].isBlock())
		{
			console.log("Impossible d'ajouter une tour ici (bloc déjà présent");
			return false;
		}

		// On vérifie que l'ajout n'empêche pas les ennemis de trouver un chemin jusqu'à la sortie
		if (this.newTowerAvoidPathToExit(row, col))
		{
			console.log("Impossible d'ajouter une tour ici (ajout bloquant)");
			return false;
		}

		// On crée une nouvelle tour
		var new_tower = new Tower(row, col, tower_type, towers_characteristics);

		// On ajoute cette tour à la grille, ainsi qu'à la liste des tours
		this.grid.cells[row][col] = new_tower;
		this.towers.push(new_tower);

		return true;
	};

	this.buyTower = function (row, col, tower_type, grid, towers_characteristics)
	{
		// On vérifie que l'argent est suffisant
		if (this.player_money < towers_characteristics[tower_type]["level1"].price)
		{
			console.log("Vous n'avez pas assez d'argent pour acheter cette tour !");
			return false;
		}

		// On tente d'ajouter la tour
		var success = this.addTower(row, col, tower_type, towers_characteristics);
		if (! success)
		{
			console.log("Erreur lors de l'achat de la tour : opération annulée.");
			return false;
		}

		// Si la tour a été ajoutée, on diminue l'argent du joueur
		this.player_money -= towers_characteristics[tower_type]["level1"].price;

		// On recalcule finalement la matrice des distances jusqu'à la sortie
		grid.updateDistancesToExit();

		return true;
	};

	this.newTowerAvoidPathToExit = function (row, col)
	{
		// S'il s'agit de la sortie, on renvoit faux
		if (this.grid.cells[row][col].type === CELL_EXIT) return true;

		// On simule un bloc à la position spécifiée
		var current_cell_type_at_position = this.grid.cells[row][col].type;
		this.grid.cells[row][col].type = CELL_BLOCK;

		// On vérifie alors s'il existe un chemin du départ à l'arrivée
		this.grid.updateDistancesToExit();
		var added_tower_avoid_path_to_exit = ! this.grid.exitIsReachable();

		this.grid.cells[row][col].type = current_cell_type_at_position;
		this.grid.updateDistancesToExit();

		return added_tower_avoid_path_to_exit;
	};

	this.upgradeTower = function (tower)
	{
		// On vérifie que le dernier niveau de la tour n'est pas déjà atteint
		if (tower.level === tower.characteristics.nb_levels)
		{
			console.log("Le dernier niveau de cette tour est déjà atteint !");
			return false;
		}

		// On vérifie que l'argent est suffisant
		if (this.player_money < tower.characteristics["level" + parseInt(tower.level + 1)].price)
		{
			console.log("Vous n'avez pas assez d'argent pour améliorer cette tour !");
			return false;
		}

		// On passe la tour au niveau suivant
		tower.level++;

		// On diminue l'argent du joueur
		this.player_money -= tower.characteristics["level" + tower.level].price;

		return true;
	};

	this.removeTower = function (tower, is_game_reset)
	{
		// On supprime la tour du tableau des tours
		var tower_index = this.towers.indexOf(tower);
		if (tower_index === -1)
		{
			console.log("La tour à supprimer n'a pas été trouvée");
			return;
		}

		this.towers = removeElementFromArray(this.towers, tower_index);

		// On remet une case libre sur la grille
		this.grid.cells[tower.row][tower.col] = new Cell(tower.row, tower.col, CELL_EMPTY);

		// S'il ne s'agit pas d'une remise à zéro du jeu, on recalculela matrice des distances jusqu'à la sortie
		if (! is_game_reset)
			grid.updateDistancesToExit();
	};

	this.sellTower = function (tower)
	{
		// On ajoute l'argent de la vente à celui du joueur
		this.player_money += tower.characteristics["level" + tower.level].value;

		// Puis on supprime la tour du jeu
		this.removeTower(tower, true);
	}

	// --------------------------------------------------------------------------------------
	// MISE A JOUR DE LA PARTIE COURANTE (BOUCLE PRINCIPALE DU JEU)
	// --------------------------------------------------------------------------------------

	this.updateEnemies = function ()
	{
		// S'il n'y a aucun ennemi, il n'y a rien à faire
		if (this.enemies.length < 1) return;

		// On crée une nouvelle file vide (afin de la reconstruire de façon ordonnée et sans cellule vide)
		var new_enemies_queue = [];

		// On parcourt la file d'ennemis
		for (var index in this.enemies)
		{
			var current_enemy = this.enemies[index];

			// Si l'ennemi est mort, on l'ignore
			if (current_enemy.isDead())
			{
				// console.log("Ennemi mort retiré de la liste !");

				// On ajoute de l'argent au joueur
				this.player_money += current_enemy.characteristics.reward;

				this.current_level_nb_killed_enemies++;
				continue;
			}

			// Si l'ennemi est arrivé à sortir de la grille, on l'ignore
			if (current_enemy.isOnCell(this.grid.exit))
			{
				// console.log("Ennemi sur la sortie retiré de la liste !");

				this.nb_passed_enemies++;
				this.current_level_nb_passed_enemies++;
				continue;
			}

			// Sinon, on ajoute l'ennemi dans la file
			new_enemies_queue.push(current_enemy);
		}

		// On tri la file d'ennemis suivant leur proximité avec l'arrivée
		var this_current_game = this;
		new_enemies_queue.sort(function (enemy_1, enemy_2) {
			return enemy_1.getRemainingDistance(this_current_game.grid.distances_to_exit) - enemy_2.getRemainingDistance(this_current_game.grid.distances_to_exit);
		});

		this.enemies = new_enemies_queue;
	};

	this.updateTowers = function ()
	{
		// On met à jour les cibles des tours et lance les attaques (si disponibles)
		for (var index in this.towers)
		{
			var current_tower = this.towers[index];

			current_tower.updateTarget(this.enemies);
			current_tower.attackTarget();
		};
	};

	this.updateGame = function ()
	{
		this.updateState();
		this.updateEnemies();
		this.updateTowers();

		var this_current_game = this;
		setTimeout(function () {
			this_current_game.updateGame();
		}, 100);
	};
}

// Attention : cette fonction renvoit le tableau avec l'objet à supprimer en moins, elle ne MODIFIE PAS celui passé en paramètre !
function removeElementFromArray (array, index)
{
	var beggining_of_array = array.slice(0, index);
	var ending_of_array    = array.slice(index + 1);

	return beggining_of_array.concat(ending_of_array);
}
