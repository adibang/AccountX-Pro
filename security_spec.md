# Security Specification - AccounX Pro

## Data Invariants
1. A Journal Entry must be balanced (Total Debit == Total Credit).
2. Users can only write to `journal_entries` if they are authenticated and verified.
3. `accounts` structure is strictly defined; staff cannot modify account structure, only admin.

## The Dirty Dozen Payloads (Red Team Tests)
1. **Unauthenticated Write**: Attempt to create an account without login. (DENY)
2. **Imbalanced Journal**: Create entry where Debit != Credit. (DENY via app logic, rules check for numeric integrity)
3. **Identity Spoofing**: Create journal entry with `createdBy` set to another user's UID. (DENY)
4. **Account Poisoning**: Update an account code with a 1MB string. (DENY)
5. **Unauthorized Account Edit**: Staff attempting to change `initialBalance`. (DENY)
6. **Deletion of History**: Attempt to delete a posted journal entry. (RESTRICTED/DENY)
7. **Negative Balance Hack**: (Handled by business logic, but rules enforce numeric types).
8. **PII Leak**: Reading all user profiles without admin role. (DENY)
9. **Role Escalation**: Regular user trying to set their own profile role to 'admin'. (DENY)
10. **Shadow Field**: Adding `is_hidden: true` to an account. (DENY via strict keys)
11. **Future Entry**: (Valid business case often, but restricted in some scenarios).
12. **Id Poisoning**: Using a 2KB string as a document ID. (DENY via isValidId)

## Validation Helpers Strategy
- `isValidAccount(data)`
- `isValidJournalEntry(data)`
- `isValidTransaction(data)`
- `isValidUserProfile(data)`
