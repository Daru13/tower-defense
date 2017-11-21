// --------------------------------------------------------------------------------------
// TOWER DEFENSE - Camille GOBERT, Arnault PASCUAL - 2015
// --------------------------------------------------------------------------------------
// CLASSE : ENEMIE
// --------------------------------------------------------------------------------------
// Cette classe représente un ennemi.
// 
// Celui-ci peut calculer sa prochaine position, s'y déplacer, et subir des actions/tests simples.
// --------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------
// DEFINITION DE CONSTANTES (Directions des ennemis)
// --------------------------------------------------------------------------------------

DIRECTION_TOP 	 = 0;
DIRECTION_BOTTOM = 1;
DIRECTION_LEFT 	 = 2;
DIRECTION_RIGHT  = 3;

function Enemy (row, col, type, enemies_characteristics)
{
	// Position de l'ennemi sur la grille
	this.row = row;
	this.col = col;

	// Type d'ennemi
	this.enemy_type = type;

	// Points de vie et multiplicateur de la vitesse de l'ennemi
	this.hp 		 = enemies_characteristics[type].hp;
	this.speed_ratio = 1;

	// Caractéristiques de ce type d'ennemi
	this.characteristics = enemies_characteristics[type];
	
	// Position suivante, direction depuis la position courante, et angle entre la position courante et suivante
	this.next_position 				= null;
	this.direction					= undefined;
	this.angle 						= 0;

	// Informations utiles relatives au déplacement en cours
	this.time_spent_in_cell 		= 0;
	this.time_spent_in_cell_timeout = null;
	this.wait_time_in_cell 			= 0;

	// --------------------------------------------------------------------------------------
	// ACTIONS ET TESTS BASIQUES
	// --------------------------------------------------------------------------------------

	this.isDead = function ()
	{
		return this.hp === 0;
	};

	this.hit = function (damages)
	{
		this.hp -= damages;
		if (this.hp < 0) this.hp = 0;
	};

	this.isOnCell = function (cell)
	{
		return this.row === cell.row && this.col === cell.col;
	};

	this.getRemainingDistance = function (distances_to_exit)
	{
		return distances_to_exit[this.row][this.col];
	};

	// --------------------------------------------------------------------------------------
	// MISE A JOUR DE LA PROCHAINE POSITION
	// --------------------------------------------------------------------------------------
	
	this.getNextPosition = function (grid)
	{
		// Si on est sur la sortie, il n'y a pas de position suivante
		if (this.isOnCell(grid.exit)) return null;

		// On récupère les au plus quatre cellules voisines de la position courante de cet ennemi
		var neighbours = grid.getCellDirectNeighbours(grid.cells[this.row][this.col]);

		// On choisit une position voisine étant plus proche de l'arrivée
		var closer_neighbour 		  = null;
		var closer_neighbour_distance = (grid.nb_rows * grid.nb_cols) + 1;

		for (var index in neighbours)
		{
			var current_neighbour = neighbours[index];

			// Tant qu'on a un voisin bloc (distance indéfinie), on continue
			if (current_neighbour.isBlock()) continue;

			if (grid.getCellDistanceToExit(current_neighbour) < closer_neighbour_distance)
			{
				closer_neighbour 		  = current_neighbour;
				closer_neighbour_distance = grid.getCellDistanceToExit(current_neighbour);
			}
		}

		return closer_neighbour;
	};

	this.getDirection = function ()
	{
		if (this.next_position === null) return undefined;

		if (this.next_position.row === this.row - 1 && this.next_position.col === this.col) return DIRECTION_TOP;
		if (this.next_position.row === this.row + 1 && this.next_position.col === this.col) return DIRECTION_BOTTOM;
		if (this.next_position.row === this.row && this.next_position.col === this.col - 1) return DIRECTION_LEFT;
		if (this.next_position.row === this.row && this.next_position.col === this.col + 1) return DIRECTION_RIGHT;

		return undefined;
	};

	this.updateNextPosition = function (grid)
	{
		this.next_position = this.getNextPosition(grid);

		// On met aussi à jour la direction et l'angle de l'ennemi
		this.direction = this.getDirection();
		this.angle	   = undefined;

		if (this.direction === DIRECTION_TOP) 	 this.angle = - Math.PI / 2;
		if (this.direction === DIRECTION_BOTTOM) this.angle = Math.PI / 2;
		if (this.direction === DIRECTION_LEFT)   this.angle = Math.PI;
		if (this.direction === DIRECTION_RIGHT)  this.angle = 0;
	};

	// --------------------------------------------------------------------------------------
	// DEPLACEMENT
	// --------------------------------------------------------------------------------------

	this.moveToRelativePos = function (row, col)
	{
		// PAS DE GESTION DE SORTIE DE GRILLE !!!
		this.row += row;
		this.col += col;
	};

	this.moveToCell = function (cell)
	{
		this.row = cell.row;
		this.col = cell.col;
	};

	this.increaseTimeSpentInCell = function ()
	{
		this.time_spent_in_cell += 50;
		// console.log("Time spent in cell : ", this_enemy.time_spent_in_cell);

		// En cas de dépassement, on fixe le temps passé au temps d'attente dans la cellule
		if (this.time_spent_in_cell > this.wait_time_in_cell)
			this.time_spent_in_cell = this.wait_time_in_cell;

		// On incrémente à nouveau dans 50 ms
		var this_enemy = this;
		this.time_spent_in_cell_timeout = setTimeout(function () {
			this_enemy.increaseTimeSpentInCell();
		}, 50);
	}

	this.move = function (grid)
	{
		// Si la prochaine position n'est pas déjà calculée, on le fait (premier appel...)
		if (this.next_position === null)
			this.updateNextPosition(grid);

		// Si l'ennemi est mort, il ne peut plus se déplacer
		if (this.isDead())
		{
			console.log("Ennemi mort : déplacement impossible");
			return;
		}

		// Si la position suivante est à null (fin du chemin), il n'y a plus de déplacement possible
		if (this.next_position === null)
		{
			console.log("Pas de position suivante : déplacement impossible");
			return;
		}

		// On conserve une référence vers l'occurence actuelle
		var this_enemy = this;

		// On calcule la durée durant laquelle l'ennemi reste sur une case
		var enemy_speed 	   = this.characteristics.speed * this.speed_ratio;
		this.wait_time_in_cell = 1000 / enemy_speed;

		// On déplace l'ennemi
		this.moveToCell(this.next_position);
		// console.log("Déplacement effectué en ", this.next_position);

		// On calcule sa nouvelle position suivante
		this.updateNextPosition(grid);

		// On mémorise le temps passé dans la nouvelle cellule (remis à zéro, puis incrémenté chaque 5ms)
		this.time_spent_in_cell = 0;
		clearTimeout(this.time_spent_in_cell_timeout);
		this.increaseTimeSpentInCell();

		// On lui indique de se déplacer à nouveau dans this.wait_time_in_cell ms
		setTimeout(function () {
			this_enemy.move(grid);
		}, this.wait_time_in_cell);
	};
}
	