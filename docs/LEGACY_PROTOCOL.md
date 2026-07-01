# The Legacy Protocol

The contract at the heart of NeverDie: **if the user dies, everything remains — exactly as they wanted.** It must never fire falsely (user locked out / heirs reading a living person's vault) and never fail to fire (family locked out forever).

## 1. Death detection — a staged state machine

```
ACTIVE ──miss N check-ins──> UNREACHABLE ──escalation exhausted──> VERIFICATION
                                                                        │
UNSEALED <──grace period (default 14 days, user-set)── GRACE <── quorum confirms
   │                                                     ▲ user can abort at ANY stage
   └──> Legacy mode: rules execute, personas switch, Gardens transfer
```

- **Check-ins:** passive by default (any app open counts). After `N` days of silence (user-configurable, default 30): push → SMS → email → call, over an escalation window.
- **Trusted verifiers:** 3–7 people chosen by the user; quorum (default 2-of-3) must independently confirm the death in-app. Optionally require a death-certificate upload reviewed by support for high-value estates.
- **Grace period:** everything announced to the user's own channels first; a single login aborts the whole process. Anti-coercion PIN: a special "I'm fine" code that silently flags the confirmation as coerced.

## 2. Key escrow — access without trusting the server

The vault is E2E-encrypted; the server cannot read it, so it also cannot *hand it over*. Solution: **Shamir Secret Sharing** of the user's master key.

- At setup, the master key is split into `k`-of-`n` shares.
- Shares are distributed to: each heir's device (wrapped by their keys), the user's verifiers, and one share held by NeverDie (never sufficient alone).
- On `UNSEALED`, heirs' apps combine shares locally to reconstruct only the sub-keys their LegacyRules grant. Secrets marked "delete on death" are cryptographically shredded instead.

## 3. Distribution — the rules engine

Each LegacyRule executes on unseal (or at its scheduled trigger):

- **Raw delivery:** files/collections appear in the heir's own vault.
- **Avatar delivery:** the user's Digital Mind delivers the item in person — "Your father asked me to give you this letter on your 18th birthday" — the flagship emotional moment of the product.
- **Time capsules:** pre-recorded or avatar-rendered messages bound to dates/life events.
- **Executor role:** one heir can be granted manual-trigger power for `manual` rules.

## 4. Continuity after death — the part nobody else does

- The user's **Digital Mind switches to Legacy mode**: speaks of the user in a way the user configured (first person or "he used to say"), scoped per listener by the affection map, memorial-lockable by family vote.
- **Eternal Gardens survive their creator.** Guardianship of each departed persona passes down the Memory Circle (creator → co-guardians → eldest contributor …). AI performs routine care (integrity checks, re-rendering with better models as tech improves) with no human action required.
- **Funding continuity:** the *Forever* endowment tier prepays hosting; an open **export format** (documented, encrypted archive + persona card spec) guarantees families are never hostages of the company.

## 5. Abuse & edge cases

- Faked death by heirs → quorum + grace period + coercion PIN + certificate option.
- Heir dies before user → rules support fallback heirs and re-splitting of shares.
- Divorce/estrangement → rules and verifier sets are editable anytime; changes take effect immediately and are audit-logged.
- Company dies → export format + published escrow procedure (shares held by an independent foundation).
