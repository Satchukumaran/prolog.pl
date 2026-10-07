friend(pam,bob).
friend(tom,bob).
friend(tom,liz).
friend(bob,ann).
friend(bob,pat).
friend(pat,jim).

friends(X,Y):-
    friend(X,Y).

friends(X,Y):-
    friend(Y,X).

mutual_friend(X,Y,Z):-
    friends(X,Z),
    friends(Y,Z),
    X \= Y.

friend_of_friend(X,Y):-
    friends(X,Z),
    friends(Z,Y),
    X \= Y.