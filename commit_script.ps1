$filesToAdd = git ls-files --modified --others --exclude-standard
$filesToDelete = git ls-files --deleted

$messages = @(
    "Update ",
    "Refactor ",
    "Fix minor issues in ",
    "Adjust configuration in ",
    "Clean up code in ",
    "Implement changes in ",
    "Revise ",
    "Modify "
)

foreach ($file in $filesToAdd) {
    if ([string]::IsNullOrWhiteSpace($file)) { continue }
    $basename = Split-Path $file -Leaf
    $randomMsg = $messages | Get-Random
    $commitMsg = "$randomMsg$basename"
    
    Write-Host "Committing: $basename"
    git add ""$file""
    git commit -m "$commitMsg"
}

foreach ($file in $filesToDelete) {
    if ([string]::IsNullOrWhiteSpace($file)) { continue }
    $basename = Split-Path $file -Leaf
    $commitMsg = "Remove $basename"
    
    Write-Host "Removing: $basename"
    git rm ""$file""
    git commit -m "$commitMsg"
}

git push
