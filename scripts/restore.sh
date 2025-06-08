#!/bin/bash

# =================================================================
# Script για την επαναφορά της ΒΔ από ένα αρχείο backup
# =================================================================

# --- Ρυθμίσεις ---
DB_USER="your_db_user"
DB_PASS="your_secret_password"
RESTORED_DB_NAME="gym_management_db_restored" # Το όνομα της νέας ΒΔ

# --- Κύρια Λογική ---

# Έλεγχος αν δόθηκε αρχείο backup ως παράμετρος
if [ -z "$1" ]; then
    echo "ΣΦΑΛΜΑ: Δεν δόθηκε αρχείο για επαναφορά."
    echo "Χρήση: $0 /path/to/your/backup.sql.gz"
    exit 1
fi

BACKUP_FILE=$1

# Έλεγχος αν το αρχείο backup υπάρχει
if [ ! -f "${BACKUP_FILE}" ]; then
    echo "ΣΦΑΛΜΑ: Το αρχείο '${BACKUP_FILE}' δεν βρέθηκε."
    exit 1
fi

echo "--- Έναρξη διαδικασίας επαναφοράς από το αρχείο '${BACKUP_FILE}' ---"

# Δημιουργούμε τη νέα βάση δεδομένων (αν δεν υπάρχει ήδη)
mysql -u ${DB_USER} -p${DB_PASS} -e "CREATE DATABASE IF NOT EXISTS ${RESTORED_DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo "Η βάση '${RESTORED_DB_NAME}' δημιουργήθηκε (αν δεν υπήρχε)."

# Αποσυμπίεση του αρχείου και εισαγωγή στη νέα βάση δεδομένων
gunzip < ${BACKUP_FILE} | mysql -u ${DB_USER} -p${DB_PASS} ${RESTORED_DB_NAME}

if [ ${PIPESTATUS[1]} -eq 0 ]; then
  echo "Επιτυχής επαναφορά της βάσης δεδομένων στη '${RESTORED_DB_NAME}'."
else
  echo "ΣΦΑΛΜΑ: Η επαναφορά απέτυχε."
  exit 1
fi

echo "--- Η διαδικασία επαναφοράς ολοκληρώθηκε ---"

exit 0