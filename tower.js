// --------------------------------------------------------------------------------------
// TOWER DEFENSE - Camille GOBERT, Arnault PASCUAL - 2015
// --------------------------------------------------------------------------------------
// CLASSE : TOUR
// --------------------------------------------------------------------------------------
// Cette classe représente une tour, classe fille de la classe Cell (Cellule).
// 
// Cette classe permet de mettre à jour l'ennemi ciblé, et de l'attaquer.
// --------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------
// DEFINITION DE CONSTANTES (Etats des tours)
// --------------------------------------------------------------------------------------

TOWER_STATE_READY  = 0;
TOWER_STATE_ATTACK = 1;

function Tower (row, col, type, towers_characteristics)
{
	// On hérite de l'objet Cell : on copie donc toutes ses propriétés et méthodes
	var parent = new Cell(row, col, CELL_TOWER);
	for (var i in parent)
		this[i] = parent[i];

	// Type de tour
	this.tower_type = type;

	// Niveau et état de la tour
	this.level = 1;
	this.state = TOWER_STATE_READY;

	// Ennemi ciblé et angle entre la tour et celui-ci
	this.target = null;
	this.angle 	= 0;

	// Caractéristique de ce type de tour
	this.characteristics = towers_characteristics[type];

	// Informations utiles relatives à l'attaque en cours
	this.time_spent_attacking 		  = 0;
	this.time_spent_attacking_timeout = null;
	this.attack_duration 			  = 0;

	// --------------------------------------------------------------------------------------
	// RECHERCHE ET MISE A JOUR DE LA CIBLE
	// --------------------------------------------------------------------------------------

	this.enemyIsReachable = function (enemy)
	{
		return enemy.row <= this.row + this.characteristics["level" + this.level].range
			&& enemy.col <= this.col + this.characteristics["level" + this.level].range
			&& enemy.row >= this.row - this.characteristics["level" + this.level].range
			&& enemy.col >= this.col - this.characteristics["level" + this.level].range;
	};

	this.updateTarget = function (enemies_queue)
	{
		// On parcourt la file d'ennemis, ordonnée selon leur proximité avec l'arrivée
		for (var index in enemies_queue)
		{
			// On vérifie si l'ennemi courant est atteignable : si oui il s'agit de la nouvelle cible, si non on continue d'en chercher une
			var current_enemy = enemies_queue[index];
			if (! this.enemyIsReachable(current_enemy)) continue;
			
			// Une fois une cible trouvée, on met à jour l'angle de la tour par rapport à celui-ci
			this.target = current_enemy;
			this.angle = Math.atan2((current_enemy.row - this.row), (current_enemy.col - this.col));
			// console.log("ANGLE :" + this.angle);

			return;
		}

		// Si aucune cible n'a été trouvée, la cible de la tour est mise à null
		this.target = null;
	};

	// --------------------------------------------------------------------------------------
	// ATTAQUE DE LA CIBLE
	// --------------------------------------------------------------------------------------

	this.increaseTimeSpentAttacking = function ()
	{
		this.time_spent_attacking += 50;

		// En cas de dépassement, on arrête l'incrémentation
		if (this.time_spent_attacking > this.attack_duration)
		{
			clearTimeout(this.time_spent_attacking_timeout);
			this.time_spent_attacking = 0;
			return;
		}

		// On incrémente à nouveau dans 50 ms
		var this_enemy = this;
		this.time_spent_attacking_timeout = setTimeout(function () {
			this_enemy.increaseTimeSpentAttacking();
		}, 50);
	}

	this.attack = function (enemy)
	{
		if (! this.enemyIsReachable(enemy))
		{
			// console.log("Ennemi trop éloigné : attaque impossible.");
			return;
		}

		if (this.state === TOWER_STATE_ATTACK)
		{
			// console.log("Une attaque est déjà en cours !");
			return;
		}

		// On attaque l'ennemi - cette attaque dépend du type de la tour
		// CAS 1 : DEGATS PHYSIQUES
		if (this.characteristics["level" + this.level].type === "damages")
		{
			// console.log("Attaque de type 'damages' effectuée");

			var tower_damages = this.characteristics["level" + this.level].strength;
			enemy.hit(tower_damages);
		}

		// CAS 2 : RALENTISSEMENT
		else if (this.characteristics["level" + this.level].type === "slow")
		{
			// console.log("Attaque de type 'slow' effectuée");

			var speed_reduction_ratio = this.characteristics["level" + this.level].strength;
			enemy.speed_ratio 		 /= speed_reduction_ratio;

			// L'effet dure seulement un certain temps (2 secondes - A FIXER ?)
			setTimeout(function () {
				enemy.speed_ratio *= speed_reduction_ratio;
			}, 2000);
		}

		// Une fois l'attaque lancée, la tour passe en mode attaque pour un certain temps (elle ne peut pas attaquer à nouveau pendant ce temps)
		this.state = TOWER_STATE_ATTACK;

		// On mémorise la durée de l'attaque, et remet à zéro le temps passé à attaquer
		this.attack_duration = 1000 / this.characteristics["level" + this.level].speed;

		this.time_spent_attacking = 0;
		clearTimeout(this.time_spent_attacking_timeout);
		this.increaseTimeSpentAttacking();

		var this_tower = this;
		setTimeout(function () {
			this_tower.state = TOWER_STATE_READY;
			// console.log("Tour de nouveau prête !");
		}, this.attack_duration);
	};

	this.attackTarget = function ()
	{
		if (this.target === null) return;
		this.attack(this.target);
	};
}