---
title: Maximize Roth401k
author: Joe Chu
tags:
  - roth
  - 401k
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
date: 2025-01-31 10:14:24
---


In this post, I will perform a thorough mathematical analysis to demonstrate how to maximize your 401(k) contributions.

<!-- more -->

Since the contribution limit varies in different year, I will use `2024` for demonstration purpose.

# 1. Some Basic Data

For 2024 calendar year, the contribution limits:

➡️ `$23000`: pre-tax and roth employee contribution
➡️ `$69000`: employee + employer contribution
➡️ `$76500`: employee + employer contribution if 50 or older

source from [IRS](https://www.irs.gov/newsroom/401k-limit-increases-to-23000-for-2024-ira-limit-rises-to-7000#:~:text=401(k)%20limit%20increases%20to,Internal%20Revenue%20Service)

We have some basic assumptions as follows:

➡️ Jack (27 years old) with annual base salary of `A`, he chooses to contribute `B%` to Roth 401k in each paycheck.
➡️ Jack's employer matches `C%` of Jack's contribution
➡️ Assume that his employer offers the option of after-tax contribution (but no matching), and Jack chooses to contribute `D%`.
➡️ Jack's employer offers annual target bonus, which is `E%` of the base salary.

In our assumptions, some numbers are fixed such as `A`, `C` and `E`.

# 2. Maximize Employee Contribution

it is important to note that your Roth 401(k) contributions are calculated based on your before-tax (gross) income, even though they are made with after-tax dollars.

$$
\begin{equation}
Bonus = \frac{E}{100} \times A
\end{equation}
$$

To maximize the personal contribution:

$$
\begin{equation}
B\\% \times A + B\\% \times (\frac{E}{100} \times A) = 23000
\end{equation}
$$

We can get `B` as:

$$
\begin{equation}
B = \frac{23000}{A \times (1 + \frac{E}{100}) } \times 100
\end{equation}
$$

For example, if Jack earns `$200000` a year with target bonus of `25%`, to reach maximum contribution, he needs to set contribution percentage to be:

$$
\begin{equation}
\frac{23000}{200000 \times (1 + \frac{25}{100}) } \times 100 = 9.2
\end{equation}
$$

# 3. Maximize Employee + Employer Contribution

Reaching the maximum total contribution limit can be a bit complex, as companies have different employer matching policies. For instance, some employers may cap their match at a specific amount or percentage. Common examples include phrases like, "**The company will match 50% of your contribution, up to a maximum of 5% of your eligible pay**," or "**The company's match will not exceed 50% of the IRS limit**," and so on.

 To simplify the calculation, we assume Jack's employer is very generous and willing to set no restriction on the employer matching limit. In order to reach the maximum of `$69000`, there is still a big gap. So, Jack has to do after-tax contribution. Then, the equation would be: 
<p align="center">
    Jack’s Contributions + Employer Match + After-Tax Contributions = 69000
</p>

The employer matches `C%` of Jack's $23000 contribution. Therefore, the employer's match is:

$$
\begin{equation}
Employer Match = \frac{C}{100} \times 23000
\end{equation}
$$

Since Jack has maximized personal contribution, the total remaining contribution required after Jack’s Roth contribution is:

$$
\begin{equation}
69000−23000=46000
\end{equation}
$$

Jack will contribute `D%` of his salary `A` as after-tax contributions. Therefore:

$$
\begin{equation}
D\\% \times A = 46000 − \frac{C}{100} \times 23000
\end{equation}
$$

Therefore, `D` can be obtained as:

$$
\begin{equation}
D = \frac{46000 - \frac{C}{100} \times 23000}{A} \times 100
\end{equation}
$$

If Jack's employer matches `6%` of Jack's contribution, then Jack needs to contribute additional `17.25%` to reach the limit.

$$
\begin{equation}
\frac{46000 - \frac{50}{100} \times 23000}{200000} \times 100 = 17.25
\end{equation}
$$

# 4. Conclusion

1. Reaching the personal contribution limit is relatively straightforward, but we may also need to account for other factors, such as one-time bonuses.

2. Reaching the total contribution limit can be more complicated, as different companies have varying rules for matching contributions. The analysis above is based on general assumptions, so be sure to carefully review your company's matching policies for accurate contribution percentages.

# References
- https://www.irs.gov/newsroom/401k-limit-increases-to-23000-for-2024-ira-limit-rises-to-7000#:~:text=401(k)%20limit%20increases%20to,Internal%20Revenue%20Service