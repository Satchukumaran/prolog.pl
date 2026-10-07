% Facts
male(john).
female(mary).
parent(john, mary).
% Rules
father(X, Y) :- male(X), parent(X, Y).
mother(X, Y) :- female(X), parent(X, Y).