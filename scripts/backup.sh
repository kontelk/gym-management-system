#!/bin/bash

# =================================================================
# Script για την καθημερινή λήψη αντιγράφων ασφαλείας της ΒΔ
# =================================================================

# --- Ρυθμίσεις ---
# Ο χρήστης της βάσης δεδομένων.
DB_USER="developer"

# Ο κωδικός του χρήστη.
DB_PASS="Qwerty!2345"

# Το όνομα της βάσης δεδομένων.
DB_NAME="gym_management_db"

# Ο κατάλογος όπου θα αποθηκεύονται τα αντίγραφα ασφαλείας.
BACKUP_DIR="/var/www/project/backups"

# Το όνομα του αρχείου backup με την τρέχουσα ημερομηνία.
DATE_FORMAT=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${DATE_FORMAT}.sql.gz"

# Πόσες ημέρες θα κρατάμε τα αντίγραφα ασφαλείας.
RETENTION_DAYS=7

# --- Κύρια Λογική ---

echo "--- Έναρξη διαδικασίας backup για τη βάση '${DB_NAME}' ---"

# Δημιουργία του backup με mysqldump και άμεση συμπίεση με gzip
# Η επιλογή --single-transaction εξασφαλίζει consistent backup για InnoDB πίνακες χωρίς να "κλειδώνει" τη βάση.
mysqldump -u ${DB_USER} -p${DB_PASS} --single-transaction --databases ${DB_NAME} | gzip > ${BACKUP_FILE}

# Έλεγχος αν η προηγούμενη εντολή εκτελέστηκε επιτυχώς
if [ ${PIPESTATUS[0]} -eq 0 ]; then
  echo "Επιτυχής δημιουργία αντιγράφου ασφαλείας: ${BACKUP_FILE}"
else
  echo "ΣΦΑΛΜΑ: Η δημιουργία αντιγράφου ασφαλείας απέτυχε."
  exit 1
fi

echo "--- Διαγραφή παλαιών αντιγράφων (παλαιότερα από ${RETENTION_DAYS} ημέρες) ---"
# Εύρεση και διαγραφή αρχείων .gz στον κατάλογο backup που είναι παλαιότερα από τις ημέρες διατήρησης
find ${BACKUP_DIR} -type f -name "*.sql.gz" -mtime +${RETENTION_DAYS} -delete

echo "--- Η διαδικασία backup ολοκληρώθηκε ---"

exit 0