// --------------------------------------------------------------------------------------
// TOWER DEFENSE - Camille GOBERT, Arnault PASCUAL - 2015
// --------------------------------------------------------------------------------------
// CLASSE : GRILLE
// --------------------------------------------------------------------------------------
// Cette classe représente la grille de jeu d'une partie de Tower Defense.
// 
// Elle permet de manipuler la grille de jeu, ainsi que la matrice des distances lui étant associée.
// --------------------------------------------------------------------------------------

function Grid (nb_rows, nb_cols)
{
	// Dimensions de la grille
	this.nb_rows = nb_rows;
	this.nb_cols = nb_cols;

	// Tableau de cellules
	this.cells = [];

	// On initialise le tableau de cellules avec des cellule vides
	for (var row = 0; row < nb_rows; row++)
	{
		this.cells.push(new Array());
		for (var col = 0; col < nb_cols; col++)
			this.cells[row][col] = new Cell(row, col, CELL_EMPTY);
	}

	// Cellules d'entrée et de sortie
	this.entrance = null;
	this.exit 	  = null;

	// Matrice des distances depuis la sortie
	this.distances_to_exit = [];

	// --------------------------------------------------------------------------------------
	// TESTS BASIQUES
	// --------------------------------------------------------------------------------------

	this.posIsOutOfRange = function (row, col)
	{
		return row >= this.nb_rows
			|| col >= this.nb_cols
			|| row < 0
			|| col < 0;
	};

	this.posIsInRange = function (row, col)
	{
		return ! this.posIsOutOfRange(row, col);
	};

	// --------------------------------------------------------------------------------------
	// MISE A JOUR DE LA GRILLE
	// --------------------------------------------------------------------------------------

	this.updateEntranceAndExit = function ()
	{
		for (var row = 0; row < this.nb_rows; row++)
			for (var col = 0; col < this.nb_cols; col++)
			{
				if (this.cells[row][col].type === CELL_ENTRANCE)
					this.entrance = this.cells[row][col];

				if (this.cells[row][col].type === CELL_EXIT)
					this.exit = this.cells[row][col];
			}
	};

	// --------------------------------------------------------------------------------------
	// RECUPERATION DE CELLULES VOISINES
	// --------------------------------------------------------------------------------------

	this.getCellNeighbours = function (cell, range)
	{
		var neighbours = [];

		var top_left_row = cell.row - range;
		var top_left_col = cell.col - range;
		var bottom_right_row = cell.row + range;
		var bottom_right_col = cell.col + range;

		for (var row = top_left_row; row <= bottom_right_row; row++)
			for (var col = top_left_col; col <= bottom_right_col; col++)
			{
				if (this.posIsOutOfRange(row, col)) 	  continue;
				if (row === cell.row && col === cell.col) continue;

				neighbours.push(this.cells[row][col]);
			}

		return neighbours;
	};

	// A la différence de la fonction ci-dessus, celle-ci ne renvoit seulement les cellules en contact direct avec cell
	this.getCellDirectNeighbours = function (cell)
	{
		var neighbours = [];

		if (this.posIsInRange(cell.row + 1, cell.col))
			neighbours.push(this.cells[cell.row + 1][cell.col]);	
		
		if (this.posIsInRange(cell.row - 1, cell.col))
			neighbours.push(this.cells[cell.row - 1][cell.col]);

		if (this.posIsInRange(cell.row, cell.col + 1))
			neighbours.push(this.cells[cell.row][cell.col + 1]);

		if (this.posIsInRange(cell.row, cell.col - 1))
			neighbours.push(this.cells[cell.row][cell.col - 1]);

		return neighbours;
	};

	// --------------------------------------------------------------------------------------
	// CALCUL DE LA MATRICE DES DISTANCES
	// --------------------------------------------------------------------------------------

	this.getDistancesFromCell = function (origin)
	{
		var distances_matrix = [];
		for (var col = 0; col < this.nb_cols ; col++)
			distances_matrix.push(new Array());

		for (var row = 0; row < this.nb_rows; row++)
			for (var col = 0; col < this.nb_cols; col++)
				distances_matrix[row][col] = undefined;
		
		var cells_to_browse = [];
		cells_to_browse.push(origin);

		distances_matrix[origin.row][origin.col] = 0;

		while (cells_to_browse.length != 0)
		{
			var current_cell = cells_to_browse.pop();
			var current_cell_neighbours = this.getCellDirectNeighbours(current_cell);

			for (var index in current_cell_neighbours)
			{
				var current_neighbour = current_cell_neighbours[index];
				if (current_neighbour.isBlock()) continue;

				if (distances_matrix[current_neighbour.row][current_neighbour.col] === undefined
				||	distances_matrix[current_cell.row][current_cell.col] + 1 < distances_matrix[current_neighbour.row][current_neighbour.col])
				{
					distances_matrix[current_neighbour.row][current_neighbour.col] = distances_matrix[current_cell.row][current_cell.col] + 1;
					cells_to_browse.push(current_neighbour);
				}
			}
		}

		// console.log("Matrice des distances : \n", distances_matrix);
		return distances_matrix;
	};

	// --------------------------------------------------------------------------------------
	// OPERATIONS RELATIVES A LA MATRICE DES DISTANCES
	// --------------------------------------------------------------------------------------

	this.updateDistancesToExit = function ()
	{
		// console.log("Mise à jour des distances");
		this.distances_to_exit = this.getDistancesFromCell(this.exit);
	};

	this.getCellDistanceToExit = function (cell)
	{
		return this.distances_to_exit[cell.row][cell.col];
	};

	this.exitIsReachable = function ()
	{
		return this.getCellDistanceToExit(this.entrance) != undefined;
	};
}
