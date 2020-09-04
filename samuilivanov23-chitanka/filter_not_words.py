import re

f = open("../filtered_words_2.txt", encoding='utf-8', mode='r')
file_content = f.read()
f.close()

all_words = list(set(re.findall("\w+", file_content)))

letters_list = ["а", "б", "в", "г", "д", "е", "ж", "з", "и", "й", "к", "л", "м", "н", "о", "п", "р", "с", "т", "у", "ф", "х", "ц", "ч", "ш", "щ", "ъ", "ю", "я"]

def filterSingleRepeatingChar():
    for letter in letters_list:
        regex_string_1 = "\w+[" + letter + "]{2,}\w+"
        regex_string_2 = "\w+[" + letter + "]{2,}"
        regex_string_3 = "[" + letter + "]{2,}\w+"
        regex_string_list = [regex_string_1, regex_string_2, regex_string_3]

        for regex_string in regex_string_list:
            words_to_remove = list(set(re.findall(regex_string, file_content)))


            for word in words_to_remove:
                if word in all_words:
                    all_words.remove(word)
                    print(word)

    f = open("../unique_words_2.txt", encoding='utf-8', mode='w+')

    for word in all_words:
        f.write(word + "\n")

    f.close()

def filterDoubleRepeatingChars():
    for letter1 in letters_list:
        for letter2 in letters_list:
            if not letter1 == letter2:
                regex_string = "(?:" + letter1 + letter2 + ")+"
            
                words_to_remove = list(set(re.findall(regex_string, file_content)))


                for word in words_to_remove:
                    if word in all_words:
                        all_words.remove(word)
                        print(word)

    f = open("../unique_words_3.txt", encoding='utf-8', mode='w+')

    for word in all_words:
        f.write(word + "\n")

    f.close()

if __name__ == '__main__':
    #filterSingleRepeatingChar()
    filterDoubleRepeatingChars()