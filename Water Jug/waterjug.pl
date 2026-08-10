% Water Jug Problem
% X = 4 gallon jug
% Y = 3 gallon jug

% ---------------------------------------
% Production Rules
% ---------------------------------------

% Rule 1: Fill 4 gallon jug
move(state(X,Y), state(4,Y)) :-
    X < 4.

% Rule 2: Fill 3 gallon jug
move(state(X,Y), state(X,3)) :-
    Y < 3.

% Rule 3: Empty 4 gallon jug
move(state(X,Y), state(0,Y)) :-
    X > 0.

% Rule 4: Empty 3 gallon jug
move(state(X,Y), state(X,0)) :-
    Y > 0.

% Rule 5: Pour 4 gallon -> 3 gallon
move(state(X,Y), state(NewX,3)) :-
    X > 0,
    Y < 3,
    Transfer is min(X,3-Y),
    NewX is X-Transfer.

% Rule 6: Pour 3 gallon -> 4 gallon
move(state(X,Y), state(4,NewY)) :-
    Y > 0,
    X < 4,
    Transfer is min(Y,4-X),
    NewY is Y-Transfer.


% ---------------------------------------
% Goal
% ---------------------------------------

goal(state(2,_)).


% ---------------------------------------
% Solution
% ---------------------------------------

solve([
    state(0,0),
    state(4,0),
    state(1,3),
    state(1,0),
    state(0,1),
    state(4,1),
    state(2,3)
]).


% ---------------------------------------
% Display
% ---------------------------------------

show_solution :-
    solve(Path),
    write('Solution:'), nl,
    show_path(Path).

show_path([]).

show_path([state(X,Y)|Rest]) :-
    format('(~w,~w)~n', [X,Y]),
    show_path(Rest).