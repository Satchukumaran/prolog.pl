:- module(rules, [
    savings_rate/2,
    emergency_fund_months/2,
    debt_to_income_ratio/2,
    advice/2,
    all_advice/2
]).

/** <module> Pure business rules and financial advice logic
 *
 * This module defines derived financial metrics and advice rules.
 * All predicates are purely logical and do not perform I/O or state mutation.
 */

%!  savings_rate(+Client, -SavingsRate) is det.
%
%   Calculates the savings rate as (income - expenses) / income.
%   Guards against zero or negative income by returning 0.0.
%   Rounds the result to 4 decimal places.
savings_rate(Client, SavingsRate) :-
    get_dict(income, Client, Income),
    get_dict(expenses, Client, Expenses),
    (   Income =< 0
    ->  SavingsRate = 0.0
    ;   RawRate is (Income - Expenses) / Income,
        SavingsRate is round(RawRate * 10000) / 10000.0
    ).

%!  emergency_fund_months(+Client, -Months) is det.
%
%   Calculates the number of months the client's current savings
%   can sustain their expenses. If expenses are zero or negative,
%   returns 0.0.
emergency_fund_months(Client, Months) :-
    get_dict(savings, Client, Savings),
    get_dict(expenses, Client, Expenses),
    (   Expenses =< 0
    ->  Months = 0.0
    ;   RawMonths is Savings / Expenses,
        Months is round(RawMonths * 10) / 10.0
    ).

%!  debt_to_income_ratio(+Client, -DTI) is det.
%
%   Calculates the ratio of total debt to monthly income.
%   Guards against zero or negative income by returning 0.0.
debt_to_income_ratio(Client, DTI) :-
    get_dict(debt, Client, Debt),
    get_dict(income, Client, Income),
    (   Income =< 0
    ->  DTI = 0.0
    ;   RawDTI is Debt / Income,
        DTI is round(RawDTI * 100) / 100.0
    ).

%!  advice(+Client, -Advice) is nondet.
%
%   Generates financial advice items based on the client's profile.
%   Each Advice is a dict with keys `text` and `reason`.

% Rule 1: Insufficient emergency fund (< 3 months)
advice(Client, _{text: Text, reason: Reason}) :-
    emergency_fund_months(Client, Months),
    Months < 3.0,
    Text = "Build an emergency fund covering at least 3 to 6 months of basic living expenses.",
    Reason = "Your current savings cover less than 3 months of essential expenses, leaving you exposed to unexpected shocks.".

% Rule 2: Strong emergency fund (>= 6 months)
advice(Client, _{text: Text, reason: Reason}) :-
    emergency_fund_months(Client, Months),
    Months >= 6.0,
    Text = "Maintain your emergency reserves in a liquid, high-yield cash equivalent.",
    Reason = "You have established a solid emergency reserve covering 6 or more months of living expenses.".

% Rule 3: Zero or negative cash flow (expenses >= income)
advice(Client, _{text: Text, reason: Reason}) :-
    get_dict(expenses, Client, Expenses),
    get_dict(income, Client, Income),
    Expenses >= Income,
    Text = "Review and trim non-essential monthly expenses to achieve a positive cash flow.",
    Reason = "Your current expenses meet or exceed your monthly income, preventing long-term wealth accumulation.".

% Rule 4: High debt burden (debt > 50% of monthly income)
advice(Client, _{text: Text, reason: Reason}) :-
    get_dict(debt, Client, Debt),
    Debt > 0,
    debt_to_income_ratio(Client, DTI),
    DTI >= 0.5,
    Text = "Prioritize paying down high-interest debt using the avalanche or snowball repayment method.",
    Reason = "Your total debt exceeds 50% of your monthly income, which increases interest costs and financial strain.".

% Rule 5: Debt free
advice(Client, _{text: Text, reason: Reason}) :-
    get_dict(debt, Client, Debt),
    Debt =:= 0,
    Text = "Capitalize on your debt-free status to accelerate savings and long-term investing.",
    Reason = "Carrying no debt eliminates interest overhead and maximizes available cash flow for wealth building.".

% Rule 6: High risk tolerance with long investment horizon (>= 10 years)
advice(Client, _{text: Text, reason: Reason}) :-
    get_dict(risk, Client, high),
    get_dict(horizon, Client, Horizon),
    Horizon >= 10,
    savings_rate(Client, SR),
    SR > 0.0,
    Text = "Allocate the majority of your investment portfolio toward diversified equity index funds for compounding growth.",
    Reason = "A long horizon of 10+ years and high risk tolerance allow you to absorb short-term market swings for superior long-term returns.".

% Rule 7: Moderate risk tolerance with medium horizon (>= 5 years)
advice(Client, _{text: Text, reason: Reason}) :-
    get_dict(risk, Client, medium),
    get_dict(horizon, Client, Horizon),
    Horizon >= 5,
    savings_rate(Client, SR),
    SR > 0.0,
    Text = "Maintain a balanced portfolio combining broad-market equity index funds and fixed-income assets.",
    Reason = "A balanced allocation matches your moderate risk appetite while fostering steady growth over an intermediate horizon.".

% Rule 8: Low risk tolerance or short horizon (< 5 years)
advice(Client, _{text: Text, reason: Reason}) :-
    savings_rate(Client, SR),
    SR > 0.0,
    (   get_dict(risk, Client, low)
    ;   get_dict(horizon, Client, Horizon), Horizon < 5
    ),
    Text = "Prioritize capital preservation using short-term bonds, certificates of deposit (CDs), or treasury instruments.",
    Reason = "A conservative risk profile or short horizon under 5 years requires limiting equity volatility to protect principal.".

% Rule 9: Retirement catch-up for clients aged 40+ with low savings
advice(Client, _{text: Text, reason: Reason}) :-
    get_dict(age, Client, Age),
    Age >= 40,
    get_dict(savings, Client, Savings),
    get_dict(income, Client, Income),
    Savings < Income * 3,
    Text = "Accelerate contributions to tax-advantaged retirement accounts.",
    Reason = "At age 40 and above, standard financial milestones recommend having at least 3 times your annual income saved for retirement.".

% Rule 10: High savings rate optimization (savings rate >= 30%)
advice(Client, _{text: Text, reason: Reason}) :-
    savings_rate(Client, SR),
    SR >= 0.3,
    Text = "Maximize tax-advantaged account limits such as 401(k), IRA, or HSA plans to optimize tax efficiency.",
    Reason = "Your strong savings rate of 30% or more provides substantial investable cash that benefits from tax sheltering.".

%!  all_advice(+Client, -AdviceList) is det.
%
%   Collects all applicable advice for the client. If no rule matches,
%   provides default baseline financial advice.
all_advice(Client, AdviceList) :-
    findall(Advice, advice(Client, Advice), RawList),
    (   RawList = []
    ->  AdviceList = [_{
            text: "Establish a detailed monthly budget to build emergency savings and define clear financial goals.",
            reason: "Tracking monthly expenses and establishing baseline savings habits creates foundational financial resilience."
        }]
    ;   AdviceList = RawList
    ).
