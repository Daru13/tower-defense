# Tower defense
A simple tower defense game, written a few years ago for a web development course project.
It is not as complete as what we expected back in the time (e.g. it misses shooting animations), but remains fully playable!
It has been co-developed with Arnault P.

[You can try it out online!](https://daru13.github.io/tower-defense/)

*FYI, the comments and the game content are in French,
though the sources can be understood and the game played even though you don't speak this language!*


### Game rules
The goal of the game is to overcome the **25 levels** without dying, the number of lives being displayed in the central heart (5 by default).

A level is defined as a **set of enemies, trying to walk from the forest** (on the left) **to the castle** (on the top-right hand corner).
It ends when all the enemies of the set are either killed, or reached the castle (in which case, the player lose one life per enemy).

In order to kill the enemies, the player can build **towers** on free cells of the map.
Obviously, there must always be a path from the forest to the castle, so that enemies can always try to reach their destination.

There are **two kinds of towers available**, with different effets:
* **Cannons** (*Canons*), which hurt the enemies.
* **Net catapults** (*Ralentisseurs*), which slow them down.

Besides, it is also possible to **upgrade** a tower (up to two times each), or to **sell** one.
