import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.StreamTokenizer;
import java.util.ArrayList;
import java.util.HashMap;

public class SeatmapParser {

    private HashMap<String, String> classMap = new HashMap<String, String>();
    private ArrayList<String> seatLetters = new ArrayList<String>();
    private HashMap<String, ArrayList<String>> seatMap = new HashMap<String, ArrayList<String>>();

    public SeatmapParser() {

    }

    private void parse(String filename) throws IOException {
        StreamTokenizer t = new StreamTokenizer(new FileReader(new File(filename)));

        /*
         * read Key : Value\n until * (which denotes start of layout)
         */
        while (t.nextToken() != '*') {
            if (t.ttype != StreamTokenizer.TT_WORD) {
                throw new IllegalArgumentException("Error: ClassCode expected.");
            }

            String classCode = t.sval;

            if (t.nextToken() != ':') {
                throw new IllegalArgumentException("Error: ':' expected.");
            }

            t.nextToken();
            if (t.ttype != StreamTokenizer.TT_WORD && t.ttype != '"') {
                throw new IllegalArgumentException("Error: ClassName expected.");
            }

            String className = t.sval;

            classMap.put(classCode, className);
            seatMap.put(classCode, new ArrayList<String>());
        }

        /*
         * Read seat letters till end of line
         */
        while (t.nextToken() != StreamTokenizer.TT_NUMBER) {
            if (t.ttype == StreamTokenizer.TT_WORD) {
                seatLetters.add(t.sval);
            }
        }

        int column = 0;
        int row = (int) t.nval;

        /*
         * Read Seat configuration
         */
        while (t.nextToken() != StreamTokenizer.TT_EOF) {
            switch (t.ttype) {
                case StreamTokenizer.TT_NUMBER:
                    row = (int) t.nval;
                    column = 0;
                    break;
                case StreamTokenizer.TT_WORD:
                    String code = t.sval;
                    String letter = seatLetters.get(column);
                    if (seatMap.containsKey(code)) {
                        seatMap.get(code).add("{ row: " + row + ", letter: \"" + letter + "\"}");
                    } else {
                        System.err.println("Seat class does not exist. Seat (" + row + letter + ") ignored");
                    }
                    column++;
                    break;
                case '-':
                    // ignore seat
                    column++;
                    break;
            }
        }
    }
    
    private void printLayout() {
        for(String classCode : classMap.keySet()) {
            System.out.println(".SeatClass{ code: \"" + classCode + "\", name: \"" + classMap.get(classCode) + "\" }");
            for(String seat : seatMap.get(classCode)) {
                System.out.println("    .Seat" + seat);
            }
        }
    }

    public static void main(String[] args) {
        SeatmapParser parser = new SeatmapParser();
        try {
            parser.parse(args[0]);
        } catch (IOException e) {
            e.printStackTrace();
        }
        parser.printLayout();
    }
}
