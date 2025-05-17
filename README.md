# Backend management repo for spectral

---

## Database structure :

- auth

- creator

  - id (uuid)
  - email (string) (unique)
  - mobile (string) (nullable, unique)
  - passwordHash (string)
  - firstName (string) (nullable)
  - lastName (string) (nullable)
  - profilePicUrl (string) (nullable)
  - status (enum: userStatus) (default: ACTIVE)
  - deletedAt (timestamp) (nullable)
  - twoFactorSecret (string) (nullable)
  - twoFactorEnabled (boolean) (default: false)
  - lastLoginAt (timestamp) (nullable)
  - allowedChannels (array of strings)
  - accessLevel (enum: AccessLevel) (default: NONE)
  - createdAt (timestamp)
  - updatedAt (timestamp)
  - refreshToken (string) (nullable)
  - backupCodes (array of strings) (nullable)
  - role (string) (default: 'creator')

- editor

  - id (uuid)
  - email (string) (unique)
  - mobile (string) (nullable, unique)
  - passwordHash (string)
  - firstName (string) (nullable)
  - lastName (string) (nullable)
  - profilePicUrl (string) (nullable)
  - status (enum: userStatus) (default: ACTIVE)
  - deletedAt (timestamp) (nullable)
  - twoFactorSecret (string) (nullable)
  - twoFactorEnabled (boolean) (default: false)
  - lastLoginAt (timestamp) (nullable)
  - allowedChannels (array of strings)
  - accessLevel (enum: AccessLevel) (default: NONE)
  - createdAt (timestamp)
  - updatedAt (timestamp)
  - refreshToken (string) (nullable)
  - backupCodes (array of strings) (nullable)
  - role (string) (default: 'editor')

- session

  - id (uuid)
  - userId (uuid)
  - deviceInfo (string)
  - isRevoked (boolean) (default: false)
  - expiresAt (timestamp)
  - revokedAt (timestamp) (nullable)
  - revokedReason (string) (nullable)
  - tokenId (string) (nullable)
  - lastActive (timestamp)
  - createdAt (timestamp)
  - metadata (json) (nullable)
  - refreshTokenFamily (string) (nullable)
  - tokenVersion (number) (default: 1)
  - lastRefreshAt (timestamp) (nullable)
  - refreshCount (number) (default: 0)
  - absoluteExpiresAt (timestamp) (nullable)

- otp

  - id (uuid)
  - mobile (string)
  - code (string) (nullable)
  - verificationSid (string) (nullable)
  - expiresAt (timestamp)
  - verified (boolean) (default: false)
  - reference (string) (nullable)
  - metadata (json) (nullable)

- creator_preferences

  - id (uuid)
  - creatorId (uuid)
  - language (string) (default: 'en')
  - theme (string) (default: 'dark')
  - timeZone (string) (default: 'UTC')
  - createdAt (timestamp)
  - updatedAt (timestamp)

- editor_preferences

  - id (uuid)
  - editorId (uuid)
  - language (string) (default: 'en')
  - theme (string) (default: 'dark')
  - timeZone (string) (default: 'UTC')
  - createdAt (timestamp)
  - updatedAt (timestamp)

- media

  - id (uuid)
  - userId (uuid)
  - accountId (uuid)
  - type (enum: MediaType)
  - integrationUrl (string) (nullable)
  - integrationKey (string) (nullable)
  - createdAt (timestamp)
  - updatedAt (timestamp)

- creator_editor_map

  - id (uuid)
  - creatorId (uuid)
  - editorId (uuid)
  - status (enum: CreatorEditorMapStatus) (default: ACTIVE)
  - createdAt (timestamp)
  - updatedAt (timestamp)

- creator_account_map

  - id (uuid)
  - creatorId (uuid)
  - accountId (uuid)
  - status (enum: CreatorAccountMapStatus) (default: ACTIVE)
  - createdAt (timestamp)
  - updatedAt (timestamp)
  - refreshToken (string) (nullable)
  - accessToken (string) (nullable)
  - email (string) (nullable)

- account_editor_map

  - id (uuid)
  - accountId (uuid)
  - editorId (uuid)
  - status (enum: AccountEditorMapStatus) (default: ACTIVE)
  - createdAt (timestamp)
  - updatedAt (timestamp)

---

- example

-- create table

```sql
create table prompts if not exists (
  id uuid primary key default uuid_generate_v4(),
  name varchar(255) not null unique,
  description text,
  prompt text not null
  created_at timestamp not null default now(),
  updated_at timestamp not null default now(),
  deleted_at timestamp
);
```

-- insert data

```sql
insert into prompts (name, description, prompt) values {
    ('teacher-subject', 'this prompt will be used to generate scheduled classes that were to be taught by a teacher for a subject', 'prompt1'),
    ('student-subject', 'this prompt will be used to generate day-to-day schedule for a student to be followed according to his/her needs', 'prompt2'),
};
```

---

## File structure :

````bash
backend/
  |_ src/
    |_ **auth**/
        |_ **libs**/
            |_ < some dependent services ... >
        |_ **modules**/
            |_ **otp**/
            |_ **session**/
            |_ **user**/
            |_ **validation**/
    |_ **map**/
        |_ **modules**/
            |_ **map**/
                |_ < hexagonal-architecture >
    |_ **media**/
        |_ **libs**/
            |_ < s3 >
                |_ < hexagonal-architecture >
        |_ **modules**/
            |_ **media**/
                |_ < hexagonal-architecture >
    |_ **yt_int**/
        |_ **common**/
            |_ < config files for yt app ... >
            ```url
            https://console.cloud.google.com/apis/dashboard
            ```
        |_ **modules**/
            |_ **yt_int**/
                |_ < hexagonal-architecture >


**hexagonal-architecture**
    |_ application/
        |_ dtos/
        |_ services/
      |_ domain/
        |_ ports/
        |_ enums/
        |_ models/
      |_ infrastructure/
        |_ adapters/
        |_ entities/
      |_ presentation/
        |_ controllers/
````

---
