---
title: Understanding APY & APR
author: Joe Chu
tags:
  - apy
  - apr
categories:
  - wealth
toc: true
widgets:
  - position: left
    type: profile
    author: Joe Chu
    author_title: I like to keep knowledge and memories visible and readable.
    location: Fremont, CA
    avatar: https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/misc/site/me.jpeg
    avatar_rounded: false
    gravatar: null
    follow_link: https://github.com/chuzcjoe
    social_links:
      Github:
        icon: fab fa-github
        url: https://github.com/chuzcjoe
      Linkedin:
        icon: fab fa-linkedin
        url: https://www.linkedin.com/in/joe-chu-1784b3179/
      Scholar:
        icon: fab fa-google
        url: https://scholar.google.com/citations?user=DCwJ1qcAAAAJ&hl=en
      Dribbble:
        icon: fab fa-dribbble
        url: https://dribbble.com
      RSS:
        icon: fas fa-rss
        url: /
  - position: left
    type: toc
    index: true
    collapsed: true
    depth: 3
  - position: left
    type: null
    links:
      Hexo: https://hexo.io
      Bulma: https://bulma.io
date: 2025-02-05 21:03:59
---


In this post, we will discuss APY & APR in depth. 

<!-- more -->

# 1. APY

APY (Annual Percentage Yield) is the actual return on an investment or savings account, including the effects of compounding over a year. Compounding means that interest is calculated and added to the principal balance once per month. This means that each month, interest is earned not only on the original deposit but also on the interest that has accumulated from previous months.

To calculate APY, we can start with compounding interest. Compound interest means that interest is earned on both the initial principal and previously earned interest. The formula for compound interest is:

$$ 
\begin{equation} 
A_{1} = P \times (1 + \frac{r}{n}) \\\\
A_{2} = A_{1} \times (1 + \frac{r}{n}) = P \times (1 + \frac{r}{n}) \times (1 + \frac{r}{n}) \\\\
... \\\\
A_{12} = A_{11} \times (1 + \frac{r}{n}) = P \times (1 + \frac{r}{n})^n
\end{equation} 
$$

where:
- $A$ is the final amount.
- $P$ is the initial principal.
- $r$ is the interest rate.
- $n$ is the number of compounding periods per year.
- $r/n$ is the interest rate every month.

For `APY`, we are interested in how much `$1` will grow after 1 year. So $P=1$.

$$ 
\begin{equation} 
APY = (1 + \frac{r}{n})^n - 1
\end{equation} 
$$

# 2. APR

APR (Annual Percentage Rate) is the annual cost of borrowing money, expressed as a percentage of the loan amount. It includes the interest rate plus certain fees but does not account for the effects of compounding. You probably see a lot on car dealership advertisement mentioning **4.99% APR**. It means you will be charged `4.99%` of the loan amount per year in interest and fees.

Given total loan amount, APR and total number of payments(months), how can we estimate the monthly loan payment? Let's derive the calculation step by step.

**Step 1: Understanding Load Payment**

A loan consists of principal and interest. Each month, the borrower makes a fixed payment, which covers:
- Interest on the remaining loan balance
- A portion that reduces the principal

The lender applies the interest first, and the remaining part reduces the principal.

**Step 2: Calculate Load Balance Over Time**

At the start, you borrow $P$. After one month, the loan balance grows due to interest:
$$ 
\begin{equation} 
\text{New Balance} = P + P \times r = P(1 + r)
\end{equation} 
$$

Since you make $M$ payment, the remaining balance becomes:
$$ 
\begin{equation} 
\text{BalanceAfterFirstMonth} = P(1 + r) - M
\end{equation} 
$$

After the second month, interest applies again and $M$ payment is made.
$$ 
\begin{equation} 
\begin{aligned}
\text{BalanceAfterSecondMonth} &= (P(1 + r) - M)(1 + r) - M \\\\
&= P(1 + r)^{2} - M(1 + r) - M
\end{aligned}
\end{equation} 
$$

Following this pattern, after $n$ months, the loan should be fully paid off, meaning the balance reaches zero:
$$ 
\begin{equation} 
P(1 + r)^{n} - M[(1 + r)^{n-1} + (1 + r)^{n-2}+...+1] = 0
\end{equation} 
$$

**Step 3: Summing the Series**

The bracketed term is a geometric series:
$$ 
\begin{equation} 
S = (1 + r)^{n-1} + (1 + r)^{n-2}+...+1
\end{equation} 
$$

The sum of a finite geometric series is:
$$ 
\begin{equation} 
S = \frac{1 - (1 + r)^{n}}{1 - (1 + r)} = \frac{1 - (1 + r)^{n}}{-r}
\end{equation} 
$$

We rewrite the equation:
$$ 
\begin{equation} 
P(1 + r)^{n} = M \frac{1 - (1 + r)^{n}}{-r} = M \frac{(1 + r)^{n} - 1}{r}
\end{equation} 
$$

Solving for $M$:
$$ 
\begin{equation} 
M = \frac{P(1 + r)^{n}r}{(1 + r)^{n} - 1} = \frac{P \times r}{1 - (1 + r)^{-n}}
\end{equation} 
$$

where:
- $M$ is the monthly payment.
- $P$ is the loan amount.
- $r$ is the month interest (**APY/12**)
- $n$ is the number of months.

This is the standard **amortization formula** used for fixed-rate loans.

For instance, if my car loan amount is `$19,000`, the dealership guarantees a fixed APR of `4.99%`, and I choose a repayment term of `60` months, then my monthly payment is:

$$ 
\begin{equation} 
M = \frac{P \times r}{1 - (1 + r)^{-n}} = \frac{19000 \times \frac{0.0499}{12}}{(1 - (1 + \frac{0.0499}{12})^{-60})} \approx 358.466
\end{equation} 
$$

One key feature of amortized loans is that most of your payment goes toward interest at the beginning of the loan. This happens because of how loan interest is calculated and how principal payments are structured in the early stages of the loan.

1. Interest is Calculated on the Remaining Balance:
- In an amortized loan, each payment is split into two parts: one portion pays off the interest and the other pays down the principal (the amount you originally borrowed).
- The interest portion is calculated on the remaining balance of the loan, so when you first take out the loan, the remaining balance is the full amount you borrowed (e.g., $20,000).

2. Larger Interest Payment at the Start:
- The amount of interest you owe each month is based on the remaining balance of the loan. At the beginning, when your loan balance is high, the interest portion is larger.
- For example, if you borrow `$20,000` at `5%` APR, the interest charged for the first month is calculated on the full `$20,000`.

$$ 
\begin{equation} 
\text{Interest for 1st month} = 20000 \times 0.05 / 12 = 83.33
\end{equation} 
$$

- As you make payments, the loan balance decreases, so the interest portion decreases over time.

3. Smaller Principal Payment Initially:

- Since the interest portion is higher at the start, the portion of your monthly payment that goes toward the principal is relatively small at first.
- Over time, as you pay down the loan balance, the interest amount reduces, allowing a larger portion of your payment to go toward the principal.

4. Amortization Schedule:
- This is why lenders often create an amortization schedule, showing how each payment is split into principal and interest. In the early months, most of your payment goes to interest, and as the loan balance decreases, more of your payment goes toward reducing the principal.

Let's say you have a `$20,000` loan at `5%` APR, with a `60-month` term. Your first few payments might look like this:

| **Payment #** | **Payment Amount** | **Interest Payment** | **Principal Payment** | **Remaining Balance** |
|---------------|--------------------|----------------------|-----------------------|-----------------------|
| 1             | $377.42            | $83.33               | $294.09               | $19,705.91            |
| 2             | $377.42            | $82.60               | $294.82               | $19,411.09            |
| 3             | $377.42            | $81.53               | $295.89               | $19,115.20            |


# References
- https://www.investopedia.com/terms/a/apy.asp
- https://www.investopedia.com/terms/a/amortization.asp
