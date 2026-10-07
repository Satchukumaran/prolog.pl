:- module(tests, [run_tests/0]).

:- use_module(library(plunit)).
:- use_module(rules).
:- use_module(server).

:- begin_tests(metrics).

test(savings_rate_normal) :-
    Client = _{income: 5000, expenses: 3000, savings: 10000, debt: 0, age: 30, risk: low, horizon: 5},
    savings_rate(Client, Rate),
    Rate =:= 0.4.

test(savings_rate_zero_income) :-
    Client = _{income: 0, expenses: 1000, savings: 500, debt: 0, age: 30, risk: low, horizon: 5},
    savings_rate(Client, Rate),
    Rate =:= 0.0.

test(savings_rate_negative) :-
    Client = _{income: 3000, expenses: 4500, savings: 1000, debt: 0, age: 30, risk: low, horizon: 5},
    savings_rate(Client, Rate),
    Rate =:= -0.5.

test(emergency_fund_months_normal) :-
    Client = _{savings: 15000, expenses: 3000, income: 5000, debt: 0, age: 30, risk: low, horizon: 5},
    emergency_fund_months(Client, Months),
    Months =:= 5.0.

test(emergency_fund_months_zero_expenses) :-
    Client = _{savings: 10000, expenses: 0, income: 5000, debt: 0, age: 30, risk: low, horizon: 5},
    emergency_fund_months(Client, Months),
    Months =:= 0.0.

test(debt_to_income_ratio_normal) :-
    Client = _{debt: 2500, income: 5000, expenses: 2000, savings: 1000, age: 30, risk: low, horizon: 5},
    debt_to_income_ratio(Client, DTI),
    DTI =:= 0.5.

test(debt_to_income_ratio_zero_income) :-
    Client = _{debt: 2500, income: 0, expenses: 1000, savings: 0, age: 30, risk: low, horizon: 5},
    debt_to_income_ratio(Client, DTI),
    DTI =:= 0.0.

:- end_tests(metrics).

:- begin_tests(advice_rules).

test(profile_young_investor_growth) :-
    % Age 28, high income, good savings, zero debt, high risk, long horizon
    Client = _{
        age: 28,
        income: 8000,
        expenses: 4000,
        savings: 30000,
        debt: 0,
        risk: high,
        horizon: 15
    },
    all_advice(Client, AdviceList),
    % Expect debt free advice
    once((member(_{text: TextDebt, reason: _}, AdviceList),
          sub_string(TextDebt, _, _, _, "debt-free"))),
    % Expect growth advice
    once((member(_{text: TextGrowth, reason: _}, AdviceList),
          sub_string(TextGrowth, _, _, _, "equity index"))),
    % Expect emergency reserve maintenance (30000/4000 = 7.5 months >= 6)
    once((member(_{text: TextEmergency, reason: _}, AdviceList),
          sub_string(TextEmergency, _, _, _, "emergency reserve"))).

test(profile_high_debt_and_emergency_deficit) :-
    % Age 35, moderate income, low savings, high debt
    Client = _{
        age: 35,
        income: 4000,
        expenses: 3500,
        savings: 3000,
        debt: 4000,
        risk: medium,
        horizon: 5
    },
    all_advice(Client, AdviceList),
    % Savings cover < 1 month expenses -> emergency fund advice
    once((member(_{text: TextEmergency, reason: _}, AdviceList),
          sub_string(TextEmergency, _, _, _, "emergency fund covering"))),
    % Debt is 4000/4000 = 1.0 (>= 0.5) -> pay down debt advice
    once((member(_{text: TextDebt, reason: _}, AdviceList),
          sub_string(TextDebt, _, _, _, "avalanche or snowball"))).

test(profile_cash_flow_deficit) :-
    Client = _{
        age: 30,
        income: 3000,
        expenses: 3500,
        savings: 1000,
        debt: 1000,
        risk: low,
        horizon: 3
    },
    all_advice(Client, AdviceList),
    once((member(_{text: TextCashFlow, reason: _}, AdviceList),
          sub_string(TextCashFlow, _, _, _, "trim non-essential"))),
    once((member(_{text: TextEmergency, reason: _}, AdviceList),
          sub_string(TextEmergency, _, _, _, "emergency fund covering"))).

test(profile_conservative_preservation) :-
    Client = _{
        age: 30,
        income: 5000,
        expenses: 3000,
        savings: 20000,
        debt: 0,
        risk: low,
        horizon: 3
    },
    all_advice(Client, AdviceList),
    once((member(_{text: TextPreserve, reason: _}, AdviceList),
          sub_string(TextPreserve, _, _, _, "capital preservation"))).

test(profile_retirement_catch_up) :-
    % Age 45, income 6000, savings 10000 (< 18000)
    Client = _{
        age: 45,
        income: 6000,
        expenses: 3000,
        savings: 10000,
        debt: 0,
        risk: medium,
        horizon: 10
    },
    all_advice(Client, AdviceList),
    once((member(_{text: TextRetirement, reason: _}, AdviceList),
          sub_string(TextRetirement, _, _, _, "retirement accounts"))).

:- end_tests(advice_rules).

:- begin_tests(validation).

test(validate_valid_payload) :-
    Payload = _{
        age: 30,
        income: 5000,
        expenses: 3000,
        savings: 10000,
        debt: 0,
        risk: "medium",
        horizon: 10
    },
    validate_client(Payload, Client, Error),
    Error == none,
    Client.age =:= 30,
    Client.risk == medium.

test(validate_missing_field) :-
    Payload = _{
        income: 5000,
        expenses: 3000,
        savings: 10000,
        debt: 0,
        risk: "low",
        horizon: 5
    },
    validate_client(Payload, _, Error),
    once(sub_string(Error, _, _, _, "Missing required field: 'age'")).

test(validate_negative_number) :-
    Payload = _{
        age: 30,
        income: -100,
        expenses: 3000,
        savings: 10000,
        debt: 0,
        risk: "low",
        horizon: 5
    },
    validate_client(Payload, _, Error),
    once(sub_string(Error, _, _, _, "non-negative number")).

test(validate_invalid_risk) :-
    Payload = _{
        age: 30,
        income: 5000,
        expenses: 3000,
        savings: 10000,
        debt: 0,
        risk: "ultra_high",
        horizon: 5
    },
    validate_client(Payload, _, Error),
    once(sub_string(Error, _, _, _, "one of: 'low', 'medium', 'high'")).

test(validate_invalid_horizon) :-
    Payload = _{
        age: 30,
        income: 5000,
        expenses: 3000,
        savings: 10000,
        debt: 0,
        risk: "low",
        horizon: -5
    },
    validate_client(Payload, _, Error),
    once(sub_string(Error, _, _, _, "integer between 0 and 100")).

:- end_tests(validation).

