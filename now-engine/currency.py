# Optimal to store currencies in iterables or key:value pairs?
# Our data source is a bank's API endpoint. I assume json_response.content: Dict[currency/currency: float]
# Technically, a stateless component that has this promise is the obvious solution that uses resources directly.
# The missing logic is the price mechanism. e.g., USD/GBP => Inflationary pressure on GBP => Quantified by markup: float * (Q_bought/global_supply): float
currencies = ["USD", "EUR", "GBP", "THB"]

def permute(n: int, pos: int):
    def factorial(n: int):
        if n == 1: return 1
        return n * factorial(n-1)
    return factorial(n)/factorial(n - pos) # order matters, so don't divide by pos

num_exchrates = permute(len(currencies), 2) # n = 2 -> 12, verify by brute force pair matching!
print(num_exchrates)

# from google component sourced from Morningstar
exchange_rates = {
    "USD/GBP": 0.77,
    "GBP/USD": 1.29
}

# aim: we want to dynamically (not statically) compute exchange rates (memory efficiency, since it is constantly varying) 
currency_exchange = [] # [str, str]

# What I want:
"""
Let static method of getting exchange rate be: exchange_rates.get_item(f"{currency_exchange[0]}/{currency_exchange[1]}")
What if we could: 
normalised_currency_value Dict[str, float] = {
    "USD": 1
    "GBP": 1.29
    "EUR": exchange_rates["EUR/USD"] # AH! EUREKA! I ANSWERED MY OWN QUESTION!

}

Axiom: For each currency you're selling, how currency that you're buying will you get in return? => Therefore, operator is division.

Prove that this will work even if all are ledged against USD (memory usage goes from nP2 to n)

exchange_rate = normalised_currency_value[currency_exhange[1]] / normalised_currency_value[currency_exchange[0]]
"""

# In real life, we use USD as the standard. We could also normalise to gold as the standard.

# Accessing currencies: User would select it via GUI where currency is statically retrieved through memory address associated with component such as a dropdown item
""" 

C pseudocode: string currency_address = get_address((sizeof(currencies) * (currency_index + 1))).to_string();

w/o memory management (python) I just have to OnClick={() => exchange_rate[1 || 2] = currencies[i]}

^ C is too high level it would have to be assembly to have primitive memory address logic

Assembly structure code (I think):
memory variable: always a name in memory, but... statically assigned variables vs. FCF variables... if we group multiple variable declaration statements into a fn would it be considered recursion?
Duplicating a memory assigment (cloning a variable) is probably not recursion.

e.g.,
memory compiled_function_1 = sizeof()
memory compiled_function_2 = to_string()
memory compiled_function_3 = get_address = (value: any) => {}; // this will need to ensure uniqueness...

memory task_1
memory task_2
memory task 3
"""
