% Facts

in_room(bananas).
in_room(chair).
in_room(monkey).

clever(monkey).

can_climb(monkey, chair).

tall(chair).

can_move(monkey, chair, bananas).


% Rules

can_reach(X, Y) :-
    clever(X),
    near(X, Y).

get_on(X, Y) :-
    can_climb(X, Y).

under(Y, Z) :-
    in_room(Y),
    in_room(Z),
    can_move(monkey, Y, Z).

near(X, Z) :-
    get_on(X, Y),
    under(Y, Z).

near(_, Z) :-
    tall(Z).