% Facts
connected(a, b, 1).
connected(a, c, 3).
connected(b, d, 1).
connected(c, d, 1).

% Best First Search
best_first_search(Start, Goal, Path) :-
    best_first_search([[Start]], Goal, Path).

% Goal reached
best_first_search([[Goal | Path] | _], Goal, [Goal | Path]).

% Continue searching
best_first_search([Path | Paths], Goal, Solution) :-
    extend(Path, NewPaths),
    append(Paths, NewPaths, Paths1),
    best_first_search(Paths1, Goal, Solution).

% Extend current path
extend([Node | Path], NewPaths) :-
    findall(
        [NewNode, Node | Path],
        (
            connected(Node, NewNode, _),
            \+ member(NewNode, [Node | Path])
        ),
        NewPaths
    ).