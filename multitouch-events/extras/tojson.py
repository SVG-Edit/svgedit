import sys, json, codecs
infile = codecs.open(sys.argv[1], "r", "utf-8")
outfile = codecs.open(sys.argv[1][:-3], "w", "utf-8")
indata = infile.readlines()
look = False
out = "[\n"
js = []
jss = ""

def readfrompos(pos):
    global out
    global js
    
    if (indata[pos].startswith("#, -x-svg-edit-title")) or (indata[pos].startswith("#, -x-svg-edit-textContent")):
        out += '{'        
        out += '"id": '
        out += " ".join(indata[pos+1].split()[1:]) + ", "
        out += '"' + line[15:].strip() + '": '
        out += " ".join(indata[pos+2].split()[1:])
        out += '}'
    elif (indata[pos].startswith("#, -x-svg-edit-both")):
        out += '{'        
        out += '"id": '
        out += " ".join(indata[pos+1].split()[1:]) + ", "
        out += '"textContent": '
        out += '"' + " ".join(indata[pos+2].split()[1:]).split('|')[1] + ', '        
        out += '"title": '
        out += " ".join(indata[pos+2].split()[1:]).split('|')[0] + '"'
        out += '}'
    elif (indata[pos].startswith("#, -x-svg-edit-js_strings")):
        js.append((" ".join(indata[pos+1].split()[1:]), " ".join(indata[pos+2].split()[1:])))

for pos, line in enumerate(indata):
    if (not look) and (line.startswith('# ---')):
        look = True
        marker = pos
    elif (look) and (line.startswith('#, -x-svg-edit')):
        readfrompos(pos)

js.sort()

for j in js:
    jss += "  %s: %s,\n" % (j[0], j[1])

out += '{\n "js_strings": {\n'
out += str(jss)
out += '   "": ""\n }'
out += "\n}"         
out += "\n]"
out = out.replace('}{', '},\n{')
         
outfile.write(out)