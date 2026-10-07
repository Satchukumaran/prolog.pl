# Prolog Friends Network

A simple Prolog project demonstrating friendship relationships.

## Facts

```prolog
friend(pam,bob).
friend(tom,bob).
friend(tom,liz).
friend(bob,ann).
friend(bob,pat).
friend(pat,jim).
```

## Rules

```prolog
friends(X,Y):-
    friend(X,Y).

friends(X,Y):-
    friend(Y,X).
```

## Example Queries

```prolog
?- friends(bob,X).

?- friends(pam,bob).

?- friends(jim,X).
```

## Output

```
?- friends(bob,X).

X = pam ;
X = tom ;
X = ann ;
X = pat.
```

## Author

Satchu Kumaran