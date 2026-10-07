% N-Queens Problem
% Board representation:
% board(Queens, Rows, Columns, Diag1, Diag2)

% Main predicate
nqueens(N) :-
    makelist(N, Rows),
    Diagonal is 2 * N - 1,
    makelist(Diagonal, Diags),
    placeN(
        N,
        board([], Rows, Rows, Diags, Diags),
        Final
    ),
    write(Final),
    nl.

% Stop when all queens are placed
placeN(_, board(D, [], [], D1, D2),
       board(D, [], [], D1, D2)) :- !.

% Place a queen and continue
placeN(N, Board1, Result) :-
    place_a_queen(N, Board1, Board2),
    placeN(N, Board2, Result).

% Place one queen
place_a_queen(
    N,
    board(Queens, Rows, Columns, Diag1, Diag2),
    board([q(R, C) | Queens], NewRows, NewColumns,
          NewDiag1, NewDiag2)
) :-
    nextrow(R, Rows, NewRows),
    findandremove(C, Columns, NewColumns),

    D1 is N + C - R,
    findandremove(D1, Diag1, NewDiag1),

    D2 is R + C - 1,
    findandremove(D2, Diag2, NewDiag2).

% Remove an element from a list
findandremove(X, [X | Rest], Rest).

findandremove(X, [Y | Rest], [Y | Tail]) :-
    findandremove(X, Rest, Tail).

% Create a list [N, N-1, ..., 1]
makelist(1, [1]).

makelist(N, [N | Rest]) :-
    N > 1,
    N1 is N - 1,
    makelist(N1, Rest).

% Select the next row
nextrow(Row, [Row | Rest], Rest).