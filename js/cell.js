// --------------------------------------------------------------------------------------
// TOWER DEFENSE - Camille G., Arnault P. - 2015
// --------------------------------------------------------------------------------------
// CLASSE : CELLULE
// --------------------------------------------------------------------------------------
// Cette classe représente une cellule de la grille de jeu.
// 
// Très simple, elle permet d'identifier le type de cellule et si elle est bloquante ou non.
// --------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------
// DEFINITION DE CONSTANTES (Types de cellules)
// --------------------------------------------------------------------------------------

CELL_EMPTY	    = 0;
CELL_BLOCK	    = 1;
CELL_TOWER 		= 2;
CELL_ENTRANCE 	= 3;
CELL_EXIT 		= 4;

function Cell (row, col, type)
{
	// Position de la cellule
	this.row = row;
	this.col = col;

	// Type de cellule
	this.type = type;

	this.isBlock = function () {
		return this.type === CELL_TOWER
			|| this.type === CELL_BLOCK;
	};
}
