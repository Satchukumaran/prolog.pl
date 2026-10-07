:- module(server, [
    server/1,
    server/0,
    validate_client/3
]).

/** <module> HTTP server and JSON API endpoint for financial advice
 *
 * Exposes POST /advise to evaluate client financial profiles.
 * Pure business logic is delegated to rules.pl.
 */

:- use_module(library(http/thread_httpd)).
:- use_module(library(http/http_dispatch)).
:- use_module(library(http/http_json)).
:- use_module(library(http/http_cors)).
:- use_module(library(option)).

:- use_module(rules).

% Enable CORS globally
:- set_setting_default(http:cors, [*]).

%!  validate_number(+Field, +Value, -Number, -Error) is det.
%
%   Validates that Value is a non-negative number.
validate_number(_Field, Value, Value, none) :-
    number(Value),
    Value >= 0,
    !.
validate_number(Field, _Value, 0, Error) :-
    format(string(Error), "Field '~w' must be a non-negative number.", [Field]).

%!  validate_integer(+Field, +Value, +Min, +Max, -Int, -Error) is det.
%
%   Validates that Value is an integer within [Min, Max].
validate_integer(_Field, Value, Min, Max, Value, none) :-
    integer(Value),
    Value >= Min,
    Value =< Max,
    !.
validate_integer(Field, _Value, Min, Max, 0, Error) :-
    format(string(Error), "Field '~w' must be an integer between ~w and ~w.", [Field, Min, Max]).

%!  validate_risk(+Value, -RiskAtom, -Error) is det.
%
%   Validates that Value represents a valid risk tolerance ('low', 'medium', 'high').
validate_risk(Value, RiskAtom, none) :-
    (   atom(Value)
    ->  RiskAtom = Value
    ;   string(Value)
    ->  atom_string(RiskAtom, Value)
    ;   fail
    ),
    member(RiskAtom, [low, medium, high]),
    !.
validate_risk(_Value, low, "Field 'risk' must be one of: 'low', 'medium', 'high'.").

check_age(Dict, Age, Error) :-
    (   get_dict(age, Dict, Raw)
    ->  validate_integer(age, Raw, 1, 120, Age, Error)
    ;   Error = "Missing required field: 'age'."
    ).

check_income(Dict, Income, Error) :-
    (   get_dict(income, Dict, Raw)
    ->  validate_number(income, Raw, Income, Error)
    ;   Error = "Missing required field: 'income'."
    ).

check_expenses(Dict, Expenses, Error) :-
    (   get_dict(expenses, Dict, Raw)
    ->  validate_number(expenses, Raw, Expenses, Error)
    ;   Error = "Missing required field: 'expenses'."
    ).

check_savings(Dict, Savings, Error) :-
    (   get_dict(savings, Dict, Raw)
    ->  validate_number(savings, Raw, Savings, Error)
    ;   Error = "Missing required field: 'savings'."
    ).

check_debt(Dict, Debt, Error) :-
    (   get_dict(debt, Dict, Raw)
    ->  validate_number(debt, Raw, Debt, Error)
    ;   Error = "Missing required field: 'debt'."
    ).

check_risk(Dict, Risk, Error) :-
    (   get_dict(risk, Dict, Raw)
    ->  validate_risk(Raw, Risk, Error)
    ;   Error = "Missing required field: 'risk'."
    ).

check_horizon(Dict, Horizon, Error) :-
    (   get_dict(horizon, Dict, Raw)
    ->  validate_integer(horizon, Raw, 0, 100, Horizon, Error)
    ;   Error = "Missing required field: 'horizon'."
    ).

%!  validate_client(+RawDict, -Client, -Error) is det.
%
%   Validates all required fields for a financial client profile.
validate_client(RawDict, Client, Error) :-
    (   \+ is_dict(RawDict)
    ->  Error = "Request payload must be a JSON object."
    ;   validate_client_dict(RawDict, Client, Error)
    ).

validate_client_dict(Dict, Client, Error) :-
    (   check_age(Dict, _, Err0), Err0 \== none -> Error = Err0
    ;   check_income(Dict, _, Err1), Err1 \== none -> Error = Err1
    ;   check_expenses(Dict, _, Err2), Err2 \== none -> Error = Err2
    ;   check_savings(Dict, _, Err3), Err3 \== none -> Error = Err3
    ;   check_debt(Dict, _, Err4), Err4 \== none -> Error = Err4
    ;   check_risk(Dict, _, Err5), Err5 \== none -> Error = Err5
    ;   check_horizon(Dict, _, Err6), Err6 \== none -> Error = Err6
    ;   check_age(Dict, Age, _),
        check_income(Dict, Income, _),
        check_expenses(Dict, Expenses, _),
        check_savings(Dict, Savings, _),
        check_debt(Dict, Debt, _),
        check_risk(Dict, Risk, _),
        check_horizon(Dict, Horizon, _),
        Client = _{
            age: Age,
            income: Income,
            expenses: Expenses,
            savings: Savings,
            debt: Debt,
            risk: Risk,
            horizon: Horizon
        },
        Error = none
    ).

% Route handler for /advise
:- http_handler(root(advise), handle_advise, [methods([post, options])]).

%!  handle_advise(+Request) is det.
%
%   Handles incoming HTTP requests for POST /advise and preflight OPTIONS.
handle_advise(Request) :-
    option(method(options), Request),
    !,
    cors_enable(Request, [methods([post, options])]),
    format('Content-type: text/plain~n~n').
handle_advise(Request) :-
    cors_enable(Request, [methods([post, options])]),
    catch(
        http_read_json_dict(Request, RequestJson),
        _ParseError,
        (   reply_json_dict(_{error: "Invalid JSON in request body."}, [status(400)]),
            !
        )
    ),
    validate_client(RequestJson, Client, Error),
    (   Error == none
    ->  savings_rate(Client, SavingsRate),
        all_advice(Client, AdviceList),
        reply_json_dict(_{
            advice: AdviceList,
            savingsRate: SavingsRate
        })
    ;   reply_json_dict(_{error: Error}, [status(400)])
    ).

%!  server(+Port) is det.
%
%   Starts the HTTP server on Port.
server(Port) :-
    http_server(http_dispatch, [port(Port)]).

%!  server is det.
%
%   Starts the HTTP server on default port 8080.
server :-
    server(8080).

%!  main is det.
%
%   Command-line entry point to run server in the foreground.
main :-
    current_prolog_flag(os_argv, Argv),
    (   member(Arg, Argv),
        sub_string(Arg, _, _, _, "server.pl")
    ->  Port = 8080,
        server(Port),
        format('Financial Advisory Prolog API running on port ~w~n', [Port]),
        thread_get_message(_)
    ;   true
    ).

:- initialization(main, main).
