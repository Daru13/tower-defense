// --------------------------------------------------------------------------------------
// TOWER DEFENSE - Camille GOBERT, Arnault PASCUAL - 2015
// --------------------------------------------------------------------------------------
// CLASSE : MODULE GRAPHIQUE
// --------------------------------------------------------------------------------------
// Cette classe constitue le module graphique du jeu, qui gère le dessin (dans un Canvas)
// ainsi que la gestion de popups HTML utilisés par le jeu.
//
// Elle permet donc de dessiner différents éléments de la partie courante et de manipuler
// les popups nécessaires. La souris est également gérée par ce module.
// --------------------------------------------------------------------------------------

function Graphics ()
{
	// Canvas du jeu (et son contexte 2D)
	this.canvas  = $("#game_canvas")[0];
	this.context = this.canvas.getContext("2d");

	// Taux de rafraichissement du jeu (images par seconde)
	this.fps = 24;

	// Dimensions du canvas
	this.width  = this.canvas.width;
	this.height = this.canvas.height;

	// Origine de l'arrière-plan
	this.background_x = 48;
	this.background_y = 96;

	// Origine de l'avant-plan
	this.foreground_x = 0;
	this.foreground_y = 0;

	// Origine de la grille
	this.grid_x = 48;
	this.grid_y = 96;

	// Dimension d'une cellule
	this.cell_width  = 48;
	this.cell_height = 48;

	// Cellule de la grille pointée par la souris
	this.pointed_cell 				  = null;
	this.poited_cell_accept_new_tower = false;

	// Références éventuelles vers le popup affiché ou le bouton de lancement d'attaque (s'il est affiché)
	this.active_popup 	   = null;
	this.start_game_button = null;

	// Nombre d'images à charger et déjà chargées
	this.nb_images 		  = 0;
	this.nb_loaded_images = 0;

	// Images et chemins vers les images du jeu
	this.images 	  = {};
	this.images_paths = {

	/*
		misc: {
			block: "graphics/test/block.png",
		},
	*/

		UI: {
			main_icons: "graphics/ui/main_icons.png",
			background_top: "graphics/ui/background_top.png",
			attack_button: "graphics/ui/attack_button.png",
			attack_button_hover: "graphics/ui/attack_button_hover.png"
		},

		enemies: {
			soldier1: "graphics/enemies/soldier1.png",
			soldier2: "graphics/enemies/soldier2.png",
			soldier3: "graphics/enemies/soldier3.png",
			soldier4: "graphics/enemies/soldier4.png"
		},

		towers: {
			tower1: "graphics/towers/tower1.png",
			tower2: "graphics/towers/tower2.png"
		},

		backgrounds: {
			world1: "graphics/backgrounds/forest.png"
		},

		foregrounds: {
			world1: "graphics/foregrounds/forest.png"
		}
	};

	// --------------------------------------------------------------------------------------
	// CHARGEMENT DES IMAGES
	// --------------------------------------------------------------------------------------

	this.loadImage = function (path)
	{
		var new_image = new Image();
		new_image.src = path;

		return new_image;
	}

	this.loadImages = function ()
	{
		// On parcourt chaque catégorie d'images
		for (var category in this.images_paths)
		{
			// Pour chaque catégorie, on crée un objet vide...
			this.images[category] = {};

			// Puis on charge toutes les images de cette catégorie, à laquelle on fournit des références vers ces images
			for (var current_image in this.images_paths[category])
			{
				console.log("Image chargée : " + current_image);
				this.images[category][current_image] = this.loadImage(this.images_paths[category][current_image]);

				// On compte le nombre d'images à cgarger/chargées
				this.nb_images++;

				var this_graphics = this;
				$(this.images[category][current_image]).load(function () {
					this_graphics.nb_loaded_images++;
				});
			}
		}
	};

	// On lance le chargement des images lors de l'instanciation de l'objet
	this.loadImages();

	// --------------------------------------------------------------------------------------
	// INITIALISATION + GESTION DE LA SOURIS
	// --------------------------------------------------------------------------------------

	this.getMouseCoords = function (event)
	{
		var bounding_rect = event.target.getBoundingClientRect();
		return {
			x: event.clientX - bounding_rect.left,
			y: event.clientY - bounding_rect.top
		};
	};

	this.getPointedCell = function (current_game, mouse)
	{
		// Si la souris est hors de la grille, on renvoit null
		if (mouse.x < this.grid_x) 								       				 return null;
		if (mouse.x >= this.grid_x + (this.cell_width * current_game.grid.nb_cols))  return null;
		if (mouse.y < this.grid_y)									   				 return null;
		if (mouse.y >= this.grid_y + (this.cell_height * current_game.grid.nb_rows)) return null;

		// Sinon, on revoit la cellule sur laquelle le pointeur se trouve
		var pointed_row = Math.floor((mouse.y - this.grid_y) / this.cell_height);
		var pointed_col = Math.floor((mouse.x - this.grid_x) / this.cell_width);

		// On vérifie également si une tour peut être ajoutée sur cette cellule
		if (current_game.newTowerAvoidPathToExit(pointed_row, pointed_col))
			 this.pointed_cell_accept_new_tower = false;
		else this.pointed_cell_accept_new_tower = true;

		return current_game.grid.cells[pointed_row][pointed_col];
	};

	this.initMouseEvents = function (current_game, towers_characteristics)
	{
		// On mémorise une référence vers l'objet courant
		var this_graphics = this;

		// EVENEMENT : DEPLACEMENT
		$(this.canvas).mousemove(function (event) {
			// On récupère la position du clic
			var mouse = this_graphics.getMouseCoords(event);

			// SOURIS PAR DESSUS UNE CELLULE DE LA GRILLE
			// On met à jour la cellule pointée
			this_graphics.pointed_cell = this_graphics.getPointedCell(current_game, mouse);
		});

		// EVENEMENT : CLIC
		$(this.canvas).click(function (event) {
			// On récupère la position du clic
			var mouse = this_graphics.getMouseCoords(event);

			var clicked_cell = this_graphics.getPointedCell(current_game, mouse);
			if (clicked_cell === null) console.log("Clic hors de la grille.");
			else 					   console.log("Cellule cliquée : " + clicked_cell.row + ", " + clicked_cell.col);

			// Si on est en mode construction...
			if (clicked_cell != null
			&&  current_game.game_state === STATE_BUILDING)
			{
				// Si la cellule n'est pas un bloc et qu'on peut y placer une nouvelle tour, on ouvre le popup d'achat de tour
				if ((! clicked_cell.isBlock())
				&&  this_graphics.pointed_cell_accept_new_tower)
					this_graphics.displayBuyTowerPopup(clicked_cell.row, clicked_cell.col, current_game, towers_characteristics);
				// Sinon, si la cellule est une tour, on ouvre le popup d'amélioration/vente de tour
				else if (clicked_cell.type === CELL_TOWER)
					this_graphics.displayUpgradeTowerPopup(clicked_cell, current_game);
			}
		});
	};

	// --------------------------------------------------------------------------------------
	// FONCTIONS GENERALES & UTILES AU DESSIN
	// --------------------------------------------------------------------------------------

	this.getCellX = function (cell)
	{
		return this.grid_x + (this.cell_width * cell.col);
	};

	this.getCellY = function (cell)
	{
		return this.grid_y + (this.cell_height * cell.row);
	};

	this.drawLine = function (context, x1, y1, x2, y2)
	{
		context.beginPath();
		context.moveTo(x1, y1);
		context.lineTo(x2, y2);
		context.stroke();
	}

	// --------------------------------------------------------------------------------------
	// DESSIN - ARRIERE/AVANT-PLAN
	// --------------------------------------------------------------------------------------

	this.drawBackground = function (world)
	{
		var background_image = this.images.backgrounds[world];
		this.context.drawImage(background_image, 0, 0, background_image.width, background_image.height, this.background_x, this.background_y, background_image.width, background_image.height);
	};

	this.drawForeground = function (world)
	{
		var foreground_image = this.images.foregrounds[world];
		this.context.drawImage(foreground_image, 0, 0, foreground_image.width, foreground_image.height, this.foreground_x, this.foreground_y, foreground_image.width, foreground_image.height);
	};

	// --------------------------------------------------------------------------------------
	// DESSIN - TOURS
	// --------------------------------------------------------------------------------------

	this.drawTowers = function (towers)
	{
		for (var index in towers)
		{
			var current_tower = towers[index];

			// On récupère la position de la tour
			var current_tower_x = this.getCellX(current_tower);
			var current_tower_y = this.getCellY(current_tower);

			// On récupère l'image de la tour
			current_tower_image = this.images.towers[current_tower.tower_type];

			// On effectue une rotation suivant l'angle de la tour
			this.context.save();

			this.context.translate(current_tower_x + (this.cell_width / 2), current_tower_y + (this.cell_height / 2));
			this.context.rotate(current_tower.angle);
			this.context.drawImage(current_tower_image, 0, 0, current_tower_image.width, current_tower_image.height, - (this.cell_width / 2), - (this.cell_height / 2), this.cell_width, this.cell_height);

			this.context.restore();
		}
	};

	// --------------------------------------------------------------------------------------
	// DESSIN - ENEMIS
	// --------------------------------------------------------------------------------------

	this.drawEnemyHealthBar = function (enemy, x, y)
	{
		// On récupère la vie actuelle et la vie maximum de l'ennemi
		var enemy_hp 	 = enemy.hp;
		var enemy_max_hp = enemy.characteristics.hp;

		var health_bar_width 			= 40;
		var health_bar_height 			= 6;
		var health_bar_border_thickness = 2;

		// On dessine le fond de la barre de vie, puis la barre en elle-même
		this.context.fillStyle = "#333333";
		this.context.fillRect(x, y, health_bar_width, health_bar_height);

		// La couleur dépend du pourcentage de vie de l'ennemi
		var enemy_hp_percents = enemy_hp / enemy_max_hp;

		this.context.fillStyle = "#86CF30";
		if (enemy_hp_percents < 0.5)
			this.context.fillStyle = "#CF9530";
		if (enemy_hp_percents < 0.2)
			this.context.fillStyle = "#CF3F30";

		this.context.fillRect(x + health_bar_border_thickness, y + health_bar_border_thickness, (health_bar_width - (2 * health_bar_border_thickness)) * enemy_hp_percents, health_bar_height - (2 * health_bar_border_thickness));
	};

	this.drawEnemies = function (enemies)
	{
		for (var index in enemies)
		{
			var current_enemy = enemies[index];

			// On récupère la position normale de l'ennemi (angle haut-gauche de la cellule associée à sa position)
			var current_enemy_x = this.getCellX(current_enemy);
			var current_enemy_y = this.getCellY(current_enemy);

			// Suivant le temps passé dans une même position, on altère ces coordonnées (effet de déplacement)
			var current_enemy_shift_x = 0;
			var current_enemy_shift_y = 0;

			// Cela dépend de la direction de l'ennemi (mise à jour lors du calcul de la prochaine cellule)
			if 		(current_enemy.direction === DIRECTION_TOP)
				current_enemy_shift_y = - (current_enemy.time_spent_in_cell / current_enemy.wait_time_in_cell) * this.cell_height;
			else if (current_enemy.direction === DIRECTION_BOTTOM)
				current_enemy_shift_y = (current_enemy.time_spent_in_cell / current_enemy.wait_time_in_cell) * this.cell_height;
			else if (current_enemy.direction === DIRECTION_LEFT)
				current_enemy_shift_x = - (current_enemy.time_spent_in_cell / current_enemy.wait_time_in_cell) * this.cell_width;
			else if (current_enemy.direction === DIRECTION_RIGHT)
				current_enemy_shift_x = (current_enemy.time_spent_in_cell / current_enemy.wait_time_in_cell) * this.cell_width;

			// On calcule la position finale de l'ennemi
			var current_enemy_final_x = current_enemy_x + current_enemy_shift_x;
			var current_enemy_final_y = current_enemy_y + current_enemy_shift_y;

			// On effectue une rotation suivant l'angle de l'ennemi
			var current_enemy_image = this.images.enemies[current_enemy.enemy_type];
			this.context.save();

			this.context.translate(current_enemy_final_x + (this.cell_width / 2), current_enemy_final_y  + (this.cell_height / 2));
			this.context.rotate(current_enemy.angle);
			this.context.drawImage(current_enemy_image, 0, 0, current_enemy_image.width, current_enemy_image.height, - (this.cell_width / 2), - (this.cell_height / 2), this.cell_width, this.cell_height);

			this.context.restore();

			// On affiche également la barre de vie de l'ennemi
			this.drawEnemyHealthBar(current_enemy, current_enemy_final_x, current_enemy_final_y);
		}
	};

	// --------------------------------------------------------------------------------------
	// DESSIN - GRILLE
	// --------------------------------------------------------------------------------------

	this.drawGridBorders = function (grid)
	{
		// On dessine les lignes horizontales
		for (var row = 0; row < grid.nb_rows; row++)
		{
			var current_origin_x 	  = this.getCellX(grid.cells[row][0]);
			var current_origin_y 	  = this.getCellY(grid.cells[row][0]);
			var current_destination_x = current_origin_x + (grid.nb_cols * this.cell_width);
			var current_destination_y = current_origin_y;

			this.drawLine(this.context, current_origin_x, current_origin_y, current_destination_x, current_destination_y);

			// On dessine une ligne supplémentaire s'il s'agit du dernier tour de boucle
			if (row === grid.nb_rows - 1)
				this.drawLine(this.context, current_origin_x, current_origin_y + this.cell_height, current_destination_x, current_destination_y + this.cell_height);
		}

		// On dessine les lignes verticales
		for (var col = 0; col < grid.nb_cols; col++)
		{
			var current_origin_x 	  = this.getCellX(grid.cells[0][col]);
			var current_origin_y 	  = this.getCellY(grid.cells[0][col]);
			var current_destination_x = current_origin_x;
			var current_destination_y = current_origin_y + (grid.nb_rows * this.cell_height);

			this.drawLine(this.context, current_origin_x , current_origin_y, current_destination_x, current_destination_y);

			// Idem que pour la dernière ligne dans le cas des colonnes
			if (col === grid.nb_cols - 1)
				this.drawLine(this.context, current_origin_x + this.cell_width, current_origin_y, current_destination_x + this.cell_width, current_destination_y);
		}
	};

	this.highlightCell = function (current_game, cell)
	{
		var cell_x = this.getCellX(cell);
		var cell_y = this.getCellY(cell);

		// On fixe la largeur du bord du rectangle à dessiner, et sauvegarde le canvas (et le restaure à la fin)
		var border_thickness = 2;

		this.context.save();
		this.context.lineWidth = border_thickness;

		// On fixe une couleur (bordure + fond) suivant si la cellule accepte un ajout de tour ou non
		var color = undefined;

		if (this.pointed_cell_accept_new_tower)
			color = "#86CF30"
		else
			color = "#CF3F30";

		// S'il s'agit en fait d'une tour qui est pointée, on change cette couleur
		if (cell.type === CELL_TOWER)
			color = "#3082CF";

		this.context.fillStyle   = color;
		this.context.strokeStyle = color;

		// On dessine un rectangle semi-transparent et sans bordure
		this.context.globalAlpha = 0.5;
		this.context.fillRect(cell_x, cell_y, this.cell_width, this.cell_height);

		this.context.globalAlpha = 0.6;
		this.context.rect(cell_x, cell_y, this.cell_width, this.cell_height);
		// this.context.rect(cell_x - (border_thickness / 2), cell_y - (border_thickness / 2), this.cell_width + border_thickness, this.cell_height + border_thickness);
		this.context.stroke();

		this.context.restore();
	};

	// --------------------------------------------------------------------------------------
	// DESSIN - INTERFACE
	// --------------------------------------------------------------------------------------

	this.drawPlayerMoney = function (player_money)
	{
		this.context.fillStyle = "#FFFFFF";
		this.context.font = "48px \"Free Pixel\"";
		this.context.fillText(player_money, 1063, 50);
	};

	this.drawLevel = function (level)
	{
		this.context.fillStyle = "#FFFFFF";
		this.context.font = "48px \"Free Pixel\"";

		if (level < 10)
			this.context.fillText(level, 35, 50);
		else
			this.context.fillText(level, 13, 50);
	};

	this.drawNbRemainingPassages = function (nb_remaining_passages)
	{
		this.context.fillStyle = "#FFFFFF";
		this.context.font = "36px \"Free Pixel\"";

		if (nb_remaining_passages < 10)
			this.context.fillText(nb_remaining_passages, 557, 46);
		else
			this.context.fillText(nb_remaining_passages, 547, 46);
	};

	this.drawInterface = function (current_game)
	{
		// On dessine le bandeau d'arrière-plan du haut
		var background_top_image = this.images.UI["background_top"];
		this.context.drawImage(background_top_image, 0, 0, background_top_image.width, background_top_image.height, 0, 0, background_top_image.width, background_top_image.height);

		// On dessine les icônes du haut
		var main_icons_image = this.images.UI["main_icons"];
		this.context.drawImage(main_icons_image, 0, 0, main_icons_image.width, main_icons_image.height, 71, 0, main_icons_image.width, main_icons_image.height);

		// Puis on dessine les valeurs affichées (vie, argent et nombre d'ennemis déjà passés)
		this.drawLevel(current_game.level);
		this.drawNbRemainingPassages(Math.max(current_game.nb_allowed_enemies - current_game.nb_passed_enemies, -1) + 1);
		this.drawPlayerMoney(current_game.player_money);
	};

	// --------------------------------------------------------------------------------------
	// DESSIN DE LA PARTIE COURANTE
	// --------------------------------------------------------------------------------------

	// Cette fonction gère l'affichage de la partie courante au complet
	// Elle nécessite d'être appelée en boucle
	this.redraw = function (game)
	{
		// On s'assure avant tout que toutes les images sont chargées
		if (this.nb_images != this.nb_loaded_images) return;

		// Si le jeu est terminé, on affiche le popup de fin de jeu
		if (game.current_game.gameIsEnded())
			this.displayEndedGamePopup(game);

		// On dessine l'arrière-plan
		this.drawBackground(game.current_game.world);

		// On dessine les tours et les ennemis
		this.drawTowers(game.current_game.towers);
		this.drawEnemies(game.current_game.enemies);

		// DEBUG : affichage des distances
		/*
			for (var row = 0; row < game.current_game.grid.nb_rows; row++)
			for (var col = 0; col < game.current_game.grid.nb_cols; col++)
			{
				var x = this.getCellX(game.current_game.grid.cells[row][col]) + 5;
				var y = this.getCellY(game.current_game.grid.cells[row][col]) + 20;

				this.context.fillStyle = "black";
				this.context.font = "normal normal normal 12px Verdana";
				this.context.fillText(game.current_game.grid.distances_to_exit[row][col], x, y);
			}
		*/

		// Si on est en mode construction...
		if (game.current_game.game_state === STATE_BUILDING)
		{
			// On dessine la grille
			this.drawGridBorders(game.current_game.grid);

			// Si une tour ou une cellule libre est pointée, on la met en avant
			if (this.pointed_cell != null
			&& this.pointed_cell.type != CELL_BLOCK)
				this.highlightCell(game.current_game, this.pointed_cell);

			// On affiche le bouton permettant de lancer l'attaque
			this.displayStartAttackButton(game.current_game, game.levels_characteristics, game.enemies_characteristics);
		}

		// On dessine l'avant-plan
		this.drawForeground(game.current_game.world);

		// On dessine l'interface
		this.drawInterface(game.current_game);
	};

	this.draw = function (game)
	{
		// On redessine le jeu à intervalle régulier
		var this_graphics = this;

		setInterval(function () {
			this_graphics.redraw(game);
		}, 1000 / this.fps);
	}

	// --------------------------------------------------------------------------------------
	// GESTION DU POPUP D'ACHAT DE TOUR
	// --------------------------------------------------------------------------------------

	this.initBuyTowerPopup = function (current_game, towers_characteristics)
	{
		// On met à jour la liste des tours disponibles
		var towers_list = "";

		for (var current_tower_id in towers_characteristics)
		{
			towers_list += "<li class=\"" + current_tower_id + "\">";
			towers_list += "<img src=\"" + this.images_paths.towers[current_tower_id] + "\" alt=\"Image de la tour " + towers_characteristics[current_tower_id]["level1"].name + "\">";
			towers_list += "<ul>";
			towers_list += "<li class=\"tower_name\">" + towers_characteristics[current_tower_id]["level1"].name + "</li>";
			// towers_list += "<li class=\"tower_description\">" + towers_characteristics[current_tower_id]["level1"].description + "</li>";
			towers_list += "<li class=\"tower_price\"><strong>Coût :</strong> " + towers_characteristics[current_tower_id]["level1"].price + "</li>";
			towers_list += "</ul>";
			towers_list += "</li>";
		}

		$("#towers_list > ul").html(towers_list);

		// On écoute les clics sur les différentes tours listées
		$("#towers_list > ul > li").click(function (event) {
			var clicked_tower_id = this.className;

			// On affiche la partie contenant les détails sur la tour sélectionnée (si ce n'est pas déjà le cas)
			$("#selected_tower_details").show();

			// Si la tour cliquée est déjà celle sélectionnée, on ne fait rien
			if ($("#towers_list > ul > li#selected_tower").hasClass(clicked_tower_id)) return;

			// On sélectionne la tour cliquée (et déselectionne celle précédemment selectionnée, s'il y en a une)
			$("#towers_list > ul > li#selected_tower").removeAttr("id");
			$("#towers_list > ul > li." + clicked_tower_id).attr("id", "selected_tower");

			// On met à jour les détails affichés suivant la tour cliquée
			$("#selected_tower_details > h3.tower_name").text(towers_characteristics[clicked_tower_id]["level1"].name);
			$("#selected_tower_details > ul > li.tower_effect").html("<strong>Type d'attaque :</strong> " + towers_characteristics[clicked_tower_id]["level1"].type);
			$("#selected_tower_details > ul > li.tower_strength").html("<strong>Puissance :</strong> " + towers_characteristics[clicked_tower_id]["level1"].strength);
			$("#selected_tower_details > ul > li.tower_speed").html("<strong>Vitesse :</strong> " + towers_characteristics[clicked_tower_id]["level1"].speed);
			$("#selected_tower_details > ul > li.tower_range").html("<strong>Portée :</strong> " + towers_characteristics[clicked_tower_id]["level1"].range);
			$("#selected_tower_details > ul > li.tower_price").html("<strong>Coût :</strong> " + towers_characteristics[clicked_tower_id]["level1"].price);

			// On met à jour le bouton d'achat selon la tour et l'argent du joueur
			if (current_game.player_money >= towers_characteristics[clicked_tower_id]["level1"].price)
			{
				$("#add_tower_buy_button")
					.text("Acheter cette tour (coût : " + towers_characteristics[clicked_tower_id]["level1"].price + ")")
					.removeClass("button_error")
					.addClass("button_validate");
			}
			else
			{
				$("#add_tower_buy_button")
					.text("Vous ne pouvez pas acheter cette tour")
					.addClass("button_error")
					.removeClass("button_validate");
			}
		});
	};

	this.displayBuyTowerPopup = function (row, col, current_game, towers_characteristics)
	{
		// Si un popup est déjà affiché, on ne fait rien
		if (this.active_popup != null) return;

		// On mémorise une référence vers l'objet courant
		var this_graphics = this;

		// On récupère le popup concerné
		var buy_tower_popup = $("#add_tower_popup");

		// On met à jour les infos utiles dans le popup
		$("#add_tower_popup > h2").text("Achat d'une nouvelle tour en [" + row + ", " + col + "]");

		// On cache la partie contenant les détails d'une future tour sélectionnée
		$("#selected_tower_details").hide();

		// On écoute les clics sur les boutons du popup
		$("#add_tower_buy_button").click(function () {
			// S'il n'y a pas de tour sélectionnée, on ignore ce clic
			if ($("#towers_list > ul > li#selected_tower").length === 0)
			{
				console.log("Achat impossible : aucune tour n'est sélectionnée !");
				return;
			}

			// On récupère la tour sélectionnée
			var selected_tower_id = $("#towers_list > ul > li#selected_tower").attr("class");

			// Si le bouton est dans un état valide (agent à priori suffisant), on tente d'acheter la tour
			if ($("#add_tower_buy_button").hasClass("button_validate"))
			{
				var success = current_game.buyTower(row, col, selected_tower_id, current_game.grid, towers_characteristics);
				if (! success)
				{
					alert("Erreur lors de l'achat de la tour choisie.");
					return;
				}
			}
			// Si le bouton n'est pas dans un état valide, on ignore le clic
			else return;

			// On remet à zéro plusieurs éléments du popup lorsqu'on le masque
			$("#add_tower_buttons button").unbind();
			$("#selected_tower").removeAttr("id");
			$("#add_tower_buy_button")
				.text("Choissisez une tour à acheter")
				.addClass("button_error")
				.removeClass("button_validate");
			buy_tower_popup.hide();
			this_graphics.active_popup = null;
		});

		$("#add_tower_cancel_button").click(function () {
			console.log("Annuler !");

			// On remet à zéro plusieurs éléments du popup lorsqu'on le masque
			$("#add_tower_buttons button").unbind();
			$("#selected_tower").removeAttr("id");
			$("#add_tower_buy_button")
				.text("Choissisez une tour à acheter")
				.addClass("button_error")
				.removeClass("button_validate");
			buy_tower_popup.hide();
			this_graphics.active_popup = null;
		});

		// On affiche le popup
		buy_tower_popup.show();
		this_graphics.active_popup = buy_tower_popup;
	};

	// --------------------------------------------------------------------------------------
	// GESTION DU POPUP D'AMELIORATION/VENTE DE TOUR
	// --------------------------------------------------------------------------------------

	this.displayUpgradeTowerPopup = function (tower, current_game)
	{
		// Si un popup est déjà affiché, on ne fait rien
		if (this.active_popup != null) return;

		// On mémorise une référence vers l'objet courant
		var this_graphics = this;

		// On récupère le popup concerné
		var upgrade_tower_popup = $("#upgrade_tower_popup");

		// On mémorise le fait que la tour ait atteint son dernier niveau ou non
		var last_level_is_reached = tower.level === tower.characteristics.nb_levels;

		// On met à jour le titre du popup, ainsi que celui de la tour (niveau actuel + suivant)
		$("#upgrade_tower_popup > h2").text("Amélioration/vente de la tour en [" + tower.row + ", " + tower.col + "]");

		if (last_level_is_reached)
		{
			$("#selected_tower_to_upgrade_details > h3.tower_name").text(tower.characteristics["level" + tower.level].name + " (niveau maximum)");
			$("#selected_tower_to_upgrade_details > h3.upgraded_tower_name").text("");
		}
		else
		{
			$("#selected_tower_to_upgrade_details > h3.tower_name").text(tower.characteristics["level" + tower.level].name);
			$("#selected_tower_to_upgrade_details > h3.upgraded_tower_name").text("Niveau suivant : " + tower.characteristics["level" + parseInt(tower.level + 1)].name);
		}

		// On met à jour l'image de la tour
		$("#selected_tower_to_upgrade_details > img").attr("src", this.images_paths.towers[tower.tower_type]);

		// On met à jour les caractéristiques de la tour au niveau actuel + suivant
		var tower_details = "";

		if (last_level_is_reached)
		{
			tower_details += "<li class=\"tower_effect\"><strong>Type d'attaque :</strong> " + tower.characteristics["level" + tower.level].type + "</li>";
			tower_details += "<li class=\"tower_strength\"><strong>Puissance :</strong> " + tower.characteristics["level" + tower.level].strength + "</li>";
			tower_details += "<li class=\"tower_speed\"><strong>Vitesse :</strong> " + tower.characteristics["level" + tower.level].speed + "</li>";
			tower_details += "<li class=\"tower_range\"><strong>Portée :</strong> " + tower.characteristics["level" + tower.level].range + "</li>";
		}
		else
		{
			tower_details += "<li class=\"tower_effect\"><strong>Type d'attaque :</strong> " + tower.characteristics["level" + tower.level].type + "</li>";
			tower_details += "<li class=\"tower_strength\"><strong>Puissance :</strong> " + tower.characteristics["level" + tower.level].strength + " <span class=\"tower_upgrade_info\">(niveau suivant : " + tower.characteristics["level" + parseInt(tower.level + 1)].strength + ")</span></li>";
			tower_details += "<li class=\"tower_speed\"><strong>Vitesse :</strong> " + tower.characteristics["level" + tower.level].speed + " <span class=\"tower_upgrade_info\">(niveau suivant : " + tower.characteristics["level" + parseInt(tower.level + 1)].speed + ")</span></li>";
			tower_details += "<li class=\"tower_range\"><strong>Portée :</strong> " + tower.characteristics["level" + tower.level].range + " <span class=\"tower_upgrade_info\">(niveau suivant : " + tower.characteristics["level" + parseInt(tower.level + 1)].range + ")</span></li>";
			tower_details += "<li class=\"upgrade_price\"><strong>Coût de l'amélioration :</strong> " + tower.characteristics["level" + parseInt(tower.level + 1)].price + "</li>";
		}

		$("#selected_tower_to_upgrade_details > ul").html(tower_details);

		// On met à jour le prix de revente dans le bouton de vente
		$("#upgrade_tower_sell_button").text("Vendre cette tour (gain : " + tower.characteristics["level" + tower.level].value + ")");

		// On met à jour le coût de l'amélioration, ou un message si le joueur n'a pas assez d'argent/si le dernier niveau st atteint
		if (last_level_is_reached)
			$("#upgrade_tower_upgrade_button")
				.text("Dernier niveau atteint !")
				.addClass("button_error")
				.removeClass("button_validate");
		else
			if (current_game.player_money >= tower.characteristics["level" + parseInt(tower.level + 1)].price)
				$("#upgrade_tower_upgrade_button")
				.text("Améliorer cette tour (coût : " + tower.characteristics["level" + parseInt(tower.level + 1)].price + ")")
				.addClass("button_validate")
				.removeClass("button_error");
			else
				$("#upgrade_tower_upgrade_button")
				.text("Vous ne pouvez pas améliorer cette tour")
				.addClass("button_error")
				.removeClass("button_validate");

		// On écoute les clics sur les boutons du popup
		$("#upgrade_tower_upgrade_button").click(function () {
			// Si le bouton est dans un état valide (argent à priori suffisant), on tente d'acheter la tour
			if ($("#upgrade_tower_upgrade_button").hasClass("button_validate"))
			{
				var success = current_game.upgradeTower(tower);
				if (! success)
				{
					alert("Erreur lors de l'amélioration de la tour.");
					return;
				}
			}
			// Si le bouton n'est pas dans un état valide, on ignore le clic
			else return;

			console.log("Tour améliorée !");

			// On remet à zéro plusieurs éléments du popup lorsqu'on le masque
			$("#upgrade_tower_buttons button").unbind();
			upgrade_tower_popup.hide();
			this_graphics.active_popup = null;
		});

		$("#upgrade_tower_sell_button").click(function () {
			current_game.sellTower(tower);

			console.log("Tour vendue !");

			// On remet à zéro plusieurs éléments du popup lorsqu'on le masque
			$("#upgrade_tower_buttons button").unbind();
			upgrade_tower_popup.hide();
			this_graphics.active_popup = null;
		});


		$("#upgrade_tower_cancel_button").click(function () {
			// On masque le popup et remet à zéro plusieurs éléments de celui-ci
			$("#upgrade_tower_buttons button").unbind();
			upgrade_tower_popup.hide();
			this_graphics.active_popup = null;
		});

		// On affiche le popup
		upgrade_tower_popup.show();
		this_graphics.active_popup = upgrade_tower_popup;
	};

	// --------------------------------------------------------------------------------------
	// GESTION DU POPUP DE FIN DE PARTIE
	// --------------------------------------------------------------------------------------

	this.getBestPlayersTableAsHTML = function (best_players)
	{
		// On crée progressivement le tableau et son contenu sous forme de châine (!)
		var best_players_table_html = "<table><thead><th>Pseudo</th><th>Niveau atteint</th></thead>";

		// On parcourt la liste des meilleurs joueurs, et ajoute chacun au tableau
		for (var index in best_players.nicknames)
		{
			var current_best_player_nickname = best_players.nicknames[index];
			var current_best_player_level    = best_players.levels[index];

			best_players_table_html += "<tr><td>" + current_best_player_nickname + "</td><td>" + current_best_player_level + "</td></tr>";
		}

		best_players_table_html += "</html>";
		return best_players_table_html;
	};

	this.displayEndedGamePopup = function (game)
	{
		// Si un popup est déjà affiché, on ne fait rien
		if (this.active_popup != null) return;

		// On mémorise une référence vers l'objet courant
		var this_graphics = this;

		// On récupère le popup concerné
		var ended_game_popup = $("#ended_game_popup");

		// On cache automatiquement certains blcos par défaut
		$("#insufficient_score, #sufficient_score, #best_players_table").hide();

		// On distingue la victoire de la défaite
		if (game.current_game.game_state === STATE_SUCCESS)
		{
			// On met à jour le titre et les détails pour les messages
			$("#ended_game_popup > h2").text("Vous avez gagné !");
			$("#ended_game_details").text("Vous avez terminé tous les niveaux du jeu, félicitation !");
		}
		else if (game.current_game.game_state === STATE_GAME_OVER)
		{
			// On met à jour le titre et les détails
			$("#ended_game_popup > h2").text("Vous avez perdu !");
			$("#ended_game_details").text("Vous avez atteint le niveau " + game.current_game.level + ". Essayez encore !");
		}

		// On vérifie si le joueur est classé parmi les meilleurs joueurs ou non
		if (game.scoreIsSufficient())
		{
			// On affiche le bloc associé au score suffisant
			$("#sufficient_score").show();

			// On écoute le clic sur le bouton qui valide le pseudo entré
			$("#add_best_player_button").click(function() {
				var nickname = $("#player_name_input")[0].value;

				console.log(nickname);

				// S'il n'y a pas de pseudo entré, on ne fait rien
				if (nickname.length < 1)
				{
					console.log("Vous devez entrer un pseudo !");
					return;
				}

				// Si le pseudo entré est trop long, on demande d'en entrer un autre
				if (nickname.length > 16)
				{
					alert("Votre pseudo ne peut excéder 16 caractères.\nVeuillez en choisir un autre s''il vous plaît.")
					return;
				}

				// Sinon, on ajoute un meilleur joueur
				game.addBestPlayer(nickname);

				// On cache ce bloc (on remet aussi à zéro le pseudo) et affiche le tableau des meilleurs joueurs
				$("#player_name_input")[0].value = "";
				$("#sufficient_score").hide();

				var best_players_table_html = this_graphics.getBestPlayersTableAsHTML(game.best_players);
				$("#best_players_table")
					.html(best_players_table_html)
					.show();

				// On supprime également l'écoute du clic sur ce bouton (pour éviter des appels multiples par la suite)
				$("#add_best_player_button").unbind();
			});
		}
		else
		{
			// On affiche le bloc associé au score insuffisant et le tableau des meilleurs joueurs
			$("#insufficient_score").show();

			var best_players_table_html = this_graphics.getBestPlayersTableAsHTML(game.best_players);
			$("#best_players_table")
				.html(best_players_table_html)
				.show();
		}

		// On écoute les clics sur le boutons pour commencer une nouvelle partie
		$("#restart_game_button").click(function () {
			// On recommence la partie
			game.current_game.restartGame(game.levels_characteristics);
			console.log("Partie relancée !");

			// On remet à zéro plusieurs éléments du popup lorsqu'on le masque
			$("#restart_game_button").unbind();
			$("#player_name_input")[0].value = "";
			ended_game_popup.hide();
			this_graphics.active_popup = null;
		});

		// On affiche le popup
		ended_game_popup.show();
		this_graphics.active_popup = ended_game_popup;
	};

	// --------------------------------------------------------------------------------------
	// GESTION DU BOUTON DE LANCEMENT D'ATTAQUE
	// --------------------------------------------------------------------------------------

	this.displayStartAttackButton = function (current_game, levels_characteristics, enemies_characteristics)
	{
		// Si le bouton est déjà affichée, on ne fait rien
		if (this.start_game_button != null) return;

		// On crée un bouton servant à lancer l'attaque (il est automatiquement stylisé avec du CSS)
		this.start_game_button = $("<div>");
		this.start_game_button.attr("id", "start_attack");
		$("body").append(this.start_game_button);

		// On le positionne
		var start_game_button_x = 354;
		var start_game_button_y = 0;

		this.start_game_button.attr("style", "left: " + parseInt(Math.round($(this.canvas).offset().left) + start_game_button_x) + "px" + "; top: " + parseInt(Math.round($(this.canvas).offset().top) + start_game_button_y) + "px");

		// Au clic, on lance l'attaque et détruit le bouton
		var this_graphics = this;
		this.start_game_button.click(function () {
			// Si un popup est affiché, on ne fait rien
			if (this_graphics.active_popup != null) return;

			current_game.startAttack(levels_characteristics, enemies_characteristics);
			this.remove();
			this_graphics.start_game_button = null;
		});
	};
}
